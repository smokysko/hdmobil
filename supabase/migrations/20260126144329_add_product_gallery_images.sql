/*
  # Add Gallery Images to Products

  1. Updates
    - Add gallery_urls to products that currently only have main_image_url
    - Creates varied gallery by reusing available images

  2. Notes
    - Each product gets 3-4 gallery images
    - Uses the main image plus related product images
*/

UPDATE products
SET gallery_urls = ARRAY[
  main_image_url,
  CASE 
    WHEN slug LIKE '%smartphone%' OR slug LIKE '%phone%' OR slug IN ('xenon-pro-max', 'nebula-fold-z', 'horizon-lite', 'ecosmart-budget')
    THEN '/images/products/smartphone_pro_max.png'
    ELSE main_image_url
  END,
  CASE 
    WHEN slug LIKE '%smartphone%' OR slug LIKE '%phone%' OR slug IN ('xenon-pro-max', 'nebula-fold-z', 'horizon-lite', 'ecosmart-budget')
    THEN '/images/products/smartphone_lite.png'
    ELSE main_image_url
  END
]
WHERE gallery_urls IS NULL AND main_image_url IS NOT NULL;
