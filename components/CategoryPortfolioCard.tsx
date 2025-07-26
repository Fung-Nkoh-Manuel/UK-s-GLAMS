// components/CategoryPortfolioCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Import your shadcn Card components
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/scroll-animation"; // Assuming this path is correct
import { ImageModal } from "@/components/ImageModal"; // Assuming this path is correct for your modal

export function CategoryPortfolioCard({ categoryName, itemsInCategory, openImageModal }) {
  const itemCount = itemsInCategory.length;

  // Determine grid classes based on item count for the INNER grid of images
  let innerGridClasses = "grid gap-4 mt-4"; // gap-4 for inner grid, mt-4 to separate from title

  if (itemCount === 1) {
    innerGridClasses += " md:grid-cols-1";
  } else if (itemCount === 2) {
    innerGridClasses += " md:grid-cols-2";
  } else if (itemCount === 3) {
    innerGridClasses += " md:grid-cols-2";
  } else if (itemCount === 4) {
    innerGridClasses += " md:grid-cols-2"; // 2x2 grid
  } else {
    // Default for more than 4 items (e.g., 3 columns, adjust as needed)
    innerGridClasses += " md:grid-cols-2 lg:grid-cols-3";
  }

  // To maintain a global stagger for animations across all categories,
  // we'll pass down a starting overall index from the parent component.
  // For simplicity here, we'll re-initiate local staggering within each card,
  // but if you need global staggering, the parent will need to manage and pass it.
  // For this example, let's just use localIndex for stagger within the category card.
  // If you re-introduce global overallItemIndex, you'll need to pass it as a prop
  // and manage its incrementing in the parent before passing it to the next card.

  return (
    <ScrollAnimation animation="slideUp" delay={0}> {/* Optional: Animate the entire category card */}
      <Card className="p-4 h-full flex flex-col dark:bg-gray-800 dark:border-gray-700"> {/* Ensure card is flex column */}
        <CardHeader className="pb-4"> {/* Add some padding below header */}
          <CardTitle className="text-center text-3xl dark:text-white">
            {categoryName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow"> {/* This will contain the grid of images */}
          <div className={innerGridClasses}>
            {itemsInCategory.map((item, localIndex) => {
              let specificItemClasses = "";
              if (itemCount === 3 && localIndex === 2) {
                // For the 3rd item in a 3-item group, center it in a 2-column grid
                specificItemClasses = "md:col-span-2 md:justify-self-center md:max-w-[400px] mx-auto"; // mx-auto for centering on small screens too
              }

              return (
                <div // Use a div here instead of ScrollAnimation if ScrollAnimation is only for the outer Card
                  key={item.title + localIndex} // Ensure unique key for each item
                  className={`cursor-zoom-in group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${specificItemClasses}`}
                  onClick={() => openImageModal(item.image, item.title)}
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    // Removed aspect-[3/4] from here to allow images to define their own aspect ratio
                    // Or keep it here if you want all images in the inner grid to enforce the same aspect ratio
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </ScrollAnimation>
  );
}