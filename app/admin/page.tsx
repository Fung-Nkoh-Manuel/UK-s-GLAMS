"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, Video, Image, Save, X, Trash2, LogOut, Pencil } from "lucide-react";

const CATEGORIES = ["Bridal", "Formal", "Alterations", "Restoration"];

type PortfolioItem = {
  _id: string;
  title: string;
  category: string;
  url: string;
  mediaType: "image" | "video";
};

export default function AdminUploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const loadItems = async () => {
    setItemsLoading(true);
    try {
      const response = await fetch("/api/portfolio-upload");
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to load portfolio items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/portfolio-upload/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete item.");
      }
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to delete item."}`);
      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      // In edit mode, if we clear the file input, we want to restore the current item's preview
      setPreview(editingItem ? editingItem.url : null);
      setMessage(editingItem ? `Editing: "${editingItem.title}"` : "No file selected.");
      setMessageType(editingItem ? "info" : "");
      return;
    }

    // Explicitly validate file size (100MB max limit)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setFile(null);
      setPreview(editingItem ? editingItem.url : null);
      setMessage(`Error: Selected file is too large (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB). Maximum limit is 100 MB.`);
      setMessageType("error");
      
      const input = document.getElementById("media-upload") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

    setMessage(`Selected file: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    setMessageType("info");
  };

  const uploadToCloudinary = async (file: File, category: string) => {
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    
    // 1. Get signed upload parameters
    const signResponse = await fetch("/api/cloudinary-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, mediaType }),
    });

    const signData = await signResponse.json();
    
    if (!signResponse.ok) {
      throw new Error(signData.message || "Failed to get upload signature");
    }

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", signData.timestamp.toString());
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);
    formData.append("resource_type", signData.resource_type);
    
    if (signData.transformation) {
      formData.append("transformation", signData.transformation);
    }

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/${signData.resource_type}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      throw new Error(uploadResult.error?.message || "Upload to Cloudinary failed");
    }

    return uploadResult;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !category || (!file && !editingItem)) {
      setMessage("Please fill in all fields and select a file.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage(editingItem ? "Updating portfolio item..." : "Uploading to Cloudinary...");
    setMessageType("info");

    try {
      let cloudinaryResult = null;
      if (file) {
        // 1. Upload new file directly to Cloudinary from client
        cloudinaryResult = await uploadToCloudinary(file, category);
      }

      if (editingItem) {
        // Update existing item via PUT request
        const updateData: any = {
          title,
          category,
        };

        if (cloudinaryResult) {
          updateData.url = cloudinaryResult.secure_url;
          updateData.publicId = cloudinaryResult.public_id;
          updateData.mediaType = file!.type.startsWith("video/") ? "video" : "image";
          updateData.thumbnailUrl = cloudinaryResult.eager?.[0]?.secure_url || null;
          updateData.duration = cloudinaryResult.duration || null;
        }

        const response = await fetch(`/api/portfolio-upload/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to update item.");
        }

        setMessage(`✅ Success! Item "${title}" updated successfully!`);
        setMessageType("success");
      } else {
        // Save new item to your database via your server
        const saveResponse = await fetch("/api/portfolio-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            url: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            mediaType: file!.type.startsWith("video/") ? "video" : "image",
            thumbnailUrl: cloudinaryResult.eager?.[0]?.secure_url || null,
            duration: cloudinaryResult.duration || null,
          }),
        });

        const saveResponseResult = await saveResponse.json();

        if (!saveResponse.ok) {
          throw new Error(saveResponseResult.message || "Failed to save to database");
        }

        setMessage(`✅ Success! ${file!.type.startsWith("video/") ? "Video" : "Image"} uploaded successfully!`);
        setMessageType("success");
      }

      // Reset uploader form state
      setTitle("");
      setCategory(CATEGORIES[0]);
      setFile(null);
      setPreview(null);
      setEditingItem(null);
      
      const input = document.getElementById("media-upload") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }

      loadItems();
    } catch (error) {
      console.error("Upload/Update error:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Something went wrong."}`);
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setPreview(item.url);
    setFile(null);
    setMessage(`Editing: "${item.title}"`);
    setMessageType("info");

    const input = document.getElementById("media-upload") as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }

    document.getElementById("uploader-card")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setTitle("");
    setCategory(CATEGORIES[0]);
    setPreview(null);
    setFile(null);
    setMessage("");
    setMessageType("");

    const input = document.getElementById("media-upload") as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(editingItem ? editingItem.url : null);
    setMessage(editingItem ? `Editing: "${editingItem.title}"` : "");
    setMessageType(editingItem ? "info" : "");

    const input = document.getElementById("media-upload") as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const fileTypeIcon = file ? (
    file.type.startsWith("video/") ? (
      <Video className="h-5 w-5 text-rose-500" />
    ) : (
      <Image className="h-5 w-5 text-rose-500" />
    )
  ) : (
    <Upload className="h-5 w-5 text-gray-400" />
  );

  const statusClassName = {
    success: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
    error: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
    info: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  }[messageType] ?? "";

  return (
    <div className="min-h-screen p-4 md:p-8 dark:bg-gray-900">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="dark:border-gray-600 dark:text-gray-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>

        <Card id="uploader-card" className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-center dark:text-white flex items-center justify-center space-x-2">
              <Upload className="h-6 w-6 md:h-7 md:w-7 text-rose-600" />
              <span>{editingItem ? "Edit Portfolio Item" : "Admin Media Uploader"}</span>
            </CardTitle>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              {editingItem ? "Modify metadata or replace the media file below" : "Upload images or videos to your portfolio (Max: 100MB)."}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bespoke Wedding Dress"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Media File {editingItem ? "(Optional - select to replace current file)" : "(Required)"}
                </label>
                <div className="flex items-center space-x-3 p-3 border-2 border-dashed rounded-lg dark:border-gray-600">
                  {fileTypeIcon}
                  <Input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    required={!file && !editingItem}
                    className="file:text-rose-600 file:bg-rose-50 file:border-0 file:rounded-full file:py-1 file:px-3 file:mr-4 hover:file:bg-rose-100 dark:file:bg-rose-900/50 dark:file:text-rose-300"
                  />
                  {file && (
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {preview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {editingItem && !file ? "Current Media:" : "Preview:"}
                  </p>
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    {(file && file.type.startsWith("video/")) || (!file && editingItem && editingItem.mediaType === "video") ? (
                      <video src={preview} controls className="w-full max-h-64 object-contain" />
                    ) : (
                      <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
                    )}
                  </div>
                </div>
              )}

              {message && <p className={`rounded p-2 text-sm ${statusClassName}`}>{message}</p>}

              <div className="flex gap-4">
                {editingItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={uploading}
                    className="flex-1 dark:border-gray-600 dark:text-white"
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={uploading || (!file && !editingItem && !title)}
                  className={`bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 disabled:opacity-50 ${editingItem ? 'flex-1' : 'w-full animated-button'}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingItem ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingItem ? "Update Item" : "Save to Portfolio"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Manage Portfolio Items</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remove items that are outdated or uploaded by mistake.
            </p>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading items...
              </div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No portfolio items yet. Upload one above to get started.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
                        {item.mediaType === "video" ? (
                          <video src={item.url} className="h-full w-full object-cover" muted />
                        ) : (
                          <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={uploading || deletingId === item._id}
                        onClick={() => startEdit(item)}
                        className="flex-shrink-0 text-rose-600 hover:text-rose-700 animate-fade-in"
                        aria-label="Edit item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === item._id}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            {deletingId === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the item from the live site and deletes the file from
                              Cloudinary. This can't be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
