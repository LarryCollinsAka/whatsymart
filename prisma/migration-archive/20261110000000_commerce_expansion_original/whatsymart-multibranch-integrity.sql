-- WhatsyMart multi-business / multi-branch integrity constraints
-- Apply this AFTER the Prisma migration has created the tables.
-- PostgreSQL identifiers are quoted because Prisma maps the model names to snake_case
-- tables while retaining camelCase column names.

ALTER TABLE "business_profiles"
  ADD CONSTRAINT "business_profiles_capabilities_not_empty"
  CHECK (cardinality("capabilities") > 0);

ALTER TABLE "business_locations"
  ADD CONSTRAINT "business_locations_latitude_range"
  CHECK ("latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "business_locations_longitude_range"
  CHECK ("longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT "business_locations_delivery_radius_nonnegative"
  CHECK ("deliveryRadiusKm" IS NULL OR "deliveryRadiusKm" >= 0);

ALTER TABLE "product_relations"
  ADD CONSTRAINT "product_relations_no_self_link"
  CHECK ("sourceProductId" <> "targetProductId");

ALTER TABLE "supplier_retailers"
  ADD CONSTRAINT "supplier_retailers_no_self_link"
  CHECK ("supplierId" <> "retailerId");

ALTER TABLE "wholesale_prices"
  ADD CONSTRAINT "wholesale_prices_valid_quantity_range"
  CHECK ("minQuantity" > 0 AND ("maxQuantity" IS NULL OR "maxQuantity" >= "minQuantity"));

ALTER TABLE "delivery_jobs"
  ADD CONSTRAINT "delivery_jobs_exactly_one_order_source"
  CHECK (num_nonnulls("orderId", "restaurantOrderId", "businessOrderId") = 1);

ALTER TABLE "product_location_inventory"
  ADD CONSTRAINT "product_location_inventory_stock_nonnegative"
  CHECK ("stock" >= 0);

ALTER TABLE "product_variant_location_inventory"
  ADD CONSTRAINT "product_variant_location_inventory_stock_nonnegative"
  CHECK ("stock" >= 0);

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_valid_party_size"
  CHECK ("partySize" > 0),
  ADD CONSTRAINT "reservations_valid_time_range"
  CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "restaurant_order_items"
  ADD CONSTRAINT "restaurant_order_items_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "supply_order_items"
  ADD CONSTRAINT "supply_order_items_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "business_order_items"
  ADD CONSTRAINT "business_order_items_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "rfq_items"
  ADD CONSTRAINT "rfq_items_quantity_positive"
  CHECK ("quantity" > 0);

-- Cross-table ownership rules cannot be expressed as ordinary CHECK constraints.
-- Enforce these in service-layer validation or PostgreSQL constraint triggers:
--   * product.businessId = order.businessId for every OrderItem.
--   * product.businessId = location.businessId for ProductLocationInventory.
--   * variant.product.businessId = location.businessId for variant inventory.
--   * order.businessId = location.businessId when Order.locationId is set.
--   * restaurant.businessId = location.businessId for restaurant orders/reservations.
--   * menu item's restaurant businessId = location.businessId for branch menu settings.
--   * wholesale price businessId = product.businessId.
--   * supplier businessId = product.businessId for SupplyOrderItem and BusinessOrderItem.
--   * membership.businessId = location.businessId for BusinessLocationMembership.
--   * a BusinessMembership with role OWNER must exist for each newly created business.
--   * SupplierQuotationItem.rfqItemId must belong to the same RFQ as its quotation.
