import { redirect } from "next/navigation";

// This route used to duplicate the /admin page. It now just redirects,
// so old links/bookmarks to /admin/upload keep working.
export default function UploadPage() {
  redirect("/admin");
}
