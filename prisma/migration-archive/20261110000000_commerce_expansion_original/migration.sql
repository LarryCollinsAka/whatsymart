-- Whatsym commerce expansion: variants, locations, suppliers, restaurants and B2B.
-- Existing marketplace tables are retained; these are additive tables only.

CREATE TABLE "product_variants" (
  "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "name" TEXT NOT NULL, "value" TEXT NOT NULL,
  "sku" TEXT, "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0, "stock" INTEGER NOT NULL DEFAULT 0,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX "product_variants_productId_isAvailable_idx" ON "product_variants"("productId", "isAvailable");
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_locations" (
  "id" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "name" TEXT NOT NULL, "address" TEXT NOT NULL,
  "neighbourhood" TEXT, "city" TEXT NOT NULL, "region" TEXT, "country" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "deliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "offersDelivery" BOOLEAN NOT NULL DEFAULT true, "offersPickup" BOOLEAN NOT NULL DEFAULT true,
  "openingHours" JSONB, "isPrimary" BOOLEAN NOT NULL DEFAULT false, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_locations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "business_locations_sellerId_idx" ON "business_locations"("sellerId");
CREATE INDEX "business_locations_country_city_idx" ON "business_locations"("country", "city");
ALTER TABLE "business_locations" ADD CONSTRAINT "business_locations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "supplier_profiles" (
  "id" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "supplierType" TEXT NOT NULL DEFAULT 'DISTRIBUTOR',
  "companyName" TEXT NOT NULL, "description" TEXT, "contactEmail" TEXT, "contactPhone" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "supplier_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "supplier_profiles_sellerId_key" ON "supplier_profiles"("sellerId");
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "supplier_retailers" (
  "id" TEXT NOT NULL, "supplierId" TEXT NOT NULL, "retailerSellerId" TEXT NOT NULL, "productId" TEXT,
  "locationId" TEXT, "stockStatus" TEXT NOT NULL DEFAULT 'UNKNOWN', "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supplier_retailers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "supplier_retailers_supplierId_retailerSellerId_productId_key" ON "supplier_retailers"("supplierId", "retailerSellerId", "productId");
CREATE INDEX "supplier_retailers_retailerSellerId_idx" ON "supplier_retailers"("retailerSellerId");
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_retailerSellerId_fkey" FOREIGN KEY ("retailerSellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "restaurant_profiles" (
  "id" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "phone" TEXT,
  "cuisineTypes" TEXT[] NOT NULL, "preparationMins" INTEGER NOT NULL DEFAULT 20, "deliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "acceptsPickup" BOOLEAN NOT NULL DEFAULT true, "acceptsDelivery" BOOLEAN NOT NULL DEFAULT true, "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "restaurant_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "restaurant_profiles_sellerId_key" ON "restaurant_profiles"("sellerId");
ALTER TABLE "restaurant_profiles" ADD CONSTRAINT "restaurant_profiles_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "restaurant_menu_categories" (
  "id" TEXT NOT NULL, "restaurantId" TEXT NOT NULL, "name" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "restaurant_menu_categories_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "restaurant_menu_categories_restaurantId_idx" ON "restaurant_menu_categories"("restaurantId");
ALTER TABLE "restaurant_menu_categories" ADD CONSTRAINT "restaurant_menu_categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "restaurant_menu_items" (
  "id" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "imageUrl" TEXT,
  "price" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD', "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "options" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "restaurant_menu_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "restaurant_menu_items_categoryId_isAvailable_idx" ON "restaurant_menu_items"("categoryId", "isAvailable");
ALTER TABLE "restaurant_menu_items" ADD CONSTRAINT "restaurant_menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "restaurant_menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "restaurant_orders" (
  "id" TEXT NOT NULL, "restaurantId" TEXT NOT NULL, "customerId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING',
  "fulfilmentType" TEXT NOT NULL DEFAULT 'DELIVERY', "deliveryAddress" JSONB, "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "subtotal" DOUBLE PRECISION NOT NULL, "total" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD', "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "restaurant_orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "restaurant_orders_restaurantId_status_idx" ON "restaurant_orders"("restaurantId", "status");
CREATE INDEX "restaurant_orders_customerId_createdAt_idx" ON "restaurant_orders"("customerId", "createdAt");
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "restaurant_order_items" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "menuItemId" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL, "total" DOUBLE PRECISION NOT NULL, "selectedOptions" JSONB,
  CONSTRAINT "restaurant_order_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "restaurant_order_items" ADD CONSTRAINT "restaurant_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "restaurant_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "restaurant_order_items" ADD CONSTRAINT "restaurant_order_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "restaurant_menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "reservations" (
  "id" TEXT NOT NULL, "restaurantId" TEXT NOT NULL, "customerId" TEXT NOT NULL, "reservationAt" TIMESTAMP(3) NOT NULL,
  "partySize" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reservations_restaurantId_reservationAt_idx" ON "reservations"("restaurantId", "reservationAt");
CREATE INDEX "reservations_customerId_idx" ON "reservations"("customerId");
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_profiles" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "legalName" TEXT NOT NULL, "tradingName" TEXT, "registrationNo" TEXT,
  "taxId" TEXT, "businessType" TEXT, "country" TEXT NOT NULL, "city" TEXT NOT NULL, "address" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false, "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "business_profiles_userId_key" ON "business_profiles"("userId");
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "wholesale_prices" (
  "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "businessId" TEXT, "minimumQuantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "wholesale_prices_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "wholesale_prices_productId_minimumQuantity_idx" ON "wholesale_prices"("productId", "minimumQuantity");
CREATE INDEX "wholesale_prices_businessId_idx" ON "wholesale_prices"("businessId");
ALTER TABLE "wholesale_prices" ADD CONSTRAINT "wholesale_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wholesale_prices" ADD CONSTRAINT "wholesale_prices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "requests_for_quotation" (
  "id" TEXT NOT NULL, "buyerId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "quantity" INTEGER,
  "targetPrice" DOUBLE PRECISION, "currency" TEXT NOT NULL DEFAULT 'USD', "deliveryCity" TEXT, "deliveryCountry" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN', "closesAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "requests_for_quotation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "requests_for_quotation_status_createdAt_idx" ON "requests_for_quotation"("status", "createdAt");
CREATE INDEX "requests_for_quotation_buyerId_idx" ON "requests_for_quotation"("buyerId");
ALTER TABLE "requests_for_quotation" ADD CONSTRAINT "requests_for_quotation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_orders" (
  "id" TEXT NOT NULL, "buyerId" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "subtotal" DOUBLE PRECISION NOT NULL, "total" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD',
  "deliveryAddress" JSONB, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "business_orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "business_orders_buyerId_createdAt_idx" ON "business_orders"("buyerId", "createdAt");
CREATE INDEX "business_orders_sellerId_status_idx" ON "business_orders"("sellerId", "status");
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "business_order_items" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL, "total" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "business_order_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "business_order_items" ADD CONSTRAINT "business_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "business_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_order_items" ADD CONSTRAINT "business_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
