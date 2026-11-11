-- WhatsyMart PostgreSQL integrity hardening
-- Apply AFTER the Prisma-generated baseline.sql.
-- These constraints/triggers are intentionally kept separate because Prisma schema
-- currently cannot represent these cross-row / cross-table business invariants.

-- -----------------------------------------------------------------------------
-- 1. Basic row-level checks
-- -----------------------------------------------------------------------------
ALTER TABLE "delivery_jobs"
  ADD CONSTRAINT "delivery_jobs_exactly_one_order_chk"
  CHECK (num_nonnulls("orderId", "restaurantOrderId", "businessOrderId") = 1);

ALTER TABLE "product_relations"
  ADD CONSTRAINT "product_relations_no_self_link_chk"
  CHECK ("sourceProductId" <> "targetProductId");

ALTER TABLE "supplier_retailers"
  ADD CONSTRAINT "supplier_retailers_no_self_link_chk"
  CHECK ("supplierId" <> "retailerId");

ALTER TABLE "wholesale_prices"
  ADD CONSTRAINT "wholesale_prices_quantity_range_chk"
  CHECK ("minQuantity" > 0 AND ("maxQuantity" IS NULL OR "maxQuantity" >= "minQuantity"));

ALTER TABLE "products"
  ADD CONSTRAINT "products_stock_nonnegative_chk" CHECK ("stock" >= 0),
  ADD CONSTRAINT "products_price_nonnegative_chk" CHECK ("price" >= 0),
  ADD CONSTRAINT "products_compare_price_nonnegative_chk" CHECK ("comparePrice" IS NULL OR "comparePrice" >= 0);

ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_stock_nonnegative_chk" CHECK ("stock" >= 0),
  ADD CONSTRAINT "product_variants_price_nonnegative_chk" CHECK ("price" IS NULL OR "price" >= 0),
  ADD CONSTRAINT "product_variants_compare_price_nonnegative_chk" CHECK ("comparePrice" IS NULL OR "comparePrice" >= 0);

ALTER TABLE "product_location_inventory"
  ADD CONSTRAINT "product_location_inventory_stock_nonnegative_chk" CHECK ("stock" >= 0),
  ADD CONSTRAINT "product_location_inventory_price_nonnegative_chk" CHECK ("price" IS NULL OR "price" >= 0);

ALTER TABLE "product_variant_location_inventory"
  ADD CONSTRAINT "product_variant_location_inventory_stock_nonnegative_chk" CHECK ("stock" >= 0);

ALTER TABLE "wholesale_prices"
  ADD CONSTRAINT "wholesale_prices_unit_price_nonnegative_chk" CHECK ("unitPrice" >= 0);

-- -----------------------------------------------------------------------------
-- 2. Cross-business consistency triggers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION wm_check_product_location_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE product_business TEXT; location_business TEXT;
BEGIN
  SELECT "businessId" INTO product_business FROM "products" WHERE id = NEW."productId";
  SELECT "businessId" INTO location_business FROM "business_locations" WHERE id = NEW."locationId";
  IF product_business IS NULL OR location_business IS NULL OR product_business <> location_business THEN
    RAISE EXCEPTION 'Product inventory location must belong to the same business as the product';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_product_location_inventory_business_trg"
BEFORE INSERT OR UPDATE OF "productId", "locationId" ON "product_location_inventory"
FOR EACH ROW EXECUTE FUNCTION wm_check_product_location_inventory();

CREATE OR REPLACE FUNCTION wm_check_variant_location_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE variant_business TEXT; location_business TEXT;
BEGIN
  SELECT p."businessId" INTO variant_business FROM "product_variants" v JOIN "products" p ON p.id = v."productId" WHERE v.id = NEW."variantId";
  SELECT "businessId" INTO location_business FROM "business_locations" WHERE id = NEW."locationId";
  IF variant_business IS NULL OR location_business IS NULL OR variant_business <> location_business THEN
    RAISE EXCEPTION 'Variant inventory location must belong to the same business as the variant product';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_variant_location_inventory_business_trg"
BEFORE INSERT OR UPDATE OF "variantId", "locationId" ON "product_variant_location_inventory"
FOR EACH ROW EXECUTE FUNCTION wm_check_variant_location_inventory();

CREATE OR REPLACE FUNCTION wm_check_menu_item_location() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE menu_business TEXT; location_business TEXT;
BEGIN
  SELECT rp."businessId" INTO menu_business
  FROM "restaurant_menu_items" mi
  JOIN "restaurant_menu_categories" mc ON mc.id = mi."categoryId"
  JOIN "restaurant_profiles" rp ON rp.id = mc."restaurantId"
  WHERE mi.id = NEW."menuItemId";
  SELECT "businessId" INTO location_business FROM "business_locations" WHERE id = NEW."locationId";
  IF menu_business IS NULL OR location_business IS NULL OR menu_business <> location_business THEN
    RAISE EXCEPTION 'Menu item location must belong to the restaurant business';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_menu_item_location_business_trg"
BEFORE INSERT OR UPDATE OF "menuItemId", "locationId" ON "restaurant_menu_item_locations"
FOR EACH ROW EXECUTE FUNCTION wm_check_menu_item_location();

CREATE OR REPLACE FUNCTION wm_check_location_membership() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE membership_business TEXT; location_business TEXT;
BEGIN
  SELECT "businessId" INTO membership_business FROM "business_memberships" WHERE id = NEW."membershipId";
  SELECT "businessId" INTO location_business FROM "business_locations" WHERE id = NEW."locationId";
  IF membership_business IS NULL OR location_business IS NULL OR membership_business <> location_business THEN
    RAISE EXCEPTION 'Staff location must belong to the membership business';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_location_membership_business_trg"
BEFORE INSERT OR UPDATE OF "membershipId", "locationId" ON "business_location_memberships"
FOR EACH ROW EXECUTE FUNCTION wm_check_location_membership();

CREATE OR REPLACE FUNCTION wm_check_wholesale_price_business() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE product_business TEXT;
BEGIN
  SELECT "businessId" INTO product_business FROM "products" WHERE id = NEW."productId";
  IF product_business IS NULL OR product_business <> NEW."businessId" THEN
    RAISE EXCEPTION 'Wholesale price business must own the referenced product';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_wholesale_price_business_trg"
BEFORE INSERT OR UPDATE OF "productId", "businessId" ON "wholesale_prices"
FOR EACH ROW EXECUTE FUNCTION wm_check_wholesale_price_business();

CREATE OR REPLACE FUNCTION wm_check_business_order_locations() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE buyer_location_business TEXT; supplier_location_business TEXT;
BEGIN
  IF NEW."buyerBusinessId" = NEW."supplierBusinessId" THEN
    RAISE EXCEPTION 'A business cannot place a wholesale order to itself';
  END IF;
  IF NEW."buyerLocationId" IS NOT NULL THEN
    SELECT "businessId" INTO buyer_location_business FROM "business_locations" WHERE id = NEW."buyerLocationId";
    IF buyer_location_business IS DISTINCT FROM NEW."buyerBusinessId" THEN
      RAISE EXCEPTION 'Buyer location must belong to the buyer business';
    END IF;
  END IF;
  IF NEW."supplierLocationId" IS NOT NULL THEN
    SELECT "businessId" INTO supplier_location_business FROM "business_locations" WHERE id = NEW."supplierLocationId";
    IF supplier_location_business IS DISTINCT FROM NEW."supplierBusinessId" THEN
      RAISE EXCEPTION 'Supplier location must belong to the supplier business';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_business_order_locations_trg"
BEFORE INSERT OR UPDATE OF "buyerBusinessId", "supplierBusinessId", "buyerLocationId", "supplierLocationId" ON "business_orders"
FOR EACH ROW EXECUTE FUNCTION wm_check_business_order_locations();

CREATE OR REPLACE FUNCTION wm_check_business_order_item_product() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE order_supplier TEXT; product_business TEXT;
BEGIN
  SELECT "supplierBusinessId" INTO order_supplier FROM "business_orders" WHERE id = NEW."orderId";
  SELECT "businessId" INTO product_business FROM "products" WHERE id = NEW."productId";
  IF order_supplier IS NULL OR product_business IS NULL OR order_supplier <> product_business THEN
    RAISE EXCEPTION 'Business order item product must belong to the order supplier';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_business_order_item_product_trg"
BEFORE INSERT OR UPDATE OF "orderId", "productId" ON "business_order_items"
FOR EACH ROW EXECUTE FUNCTION wm_check_business_order_item_product();

CREATE OR REPLACE FUNCTION wm_check_supplier_retailer_pair() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."supplierId" = NEW."retailerId" THEN
    RAISE EXCEPTION 'A business cannot be its own supplier/retailer';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_supplier_retailer_pair_trg"
BEFORE INSERT OR UPDATE OF "supplierId", "retailerId" ON "supplier_retailers"
FOR EACH ROW EXECUTE FUNCTION wm_check_supplier_retailer_pair();

CREATE OR REPLACE FUNCTION wm_check_product_variant_value() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE variant_product TEXT; option_product TEXT;
BEGIN
  SELECT "productId" INTO variant_product FROM "product_variants" WHERE id = NEW."variantId";
  SELECT po."productId" INTO option_product
  FROM "product_option_values" pov JOIN "product_options" po ON po.id = pov."optionId"
  WHERE pov.id = NEW."optionValueId";
  IF variant_product IS NULL OR option_product IS NULL OR variant_product <> option_product THEN
    RAISE EXCEPTION 'Variant and selected option value must belong to the same product';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_product_variant_value_product_trg"
BEFORE INSERT OR UPDATE OF "variantId", "optionValueId" ON "product_variant_values"
FOR EACH ROW EXECUTE FUNCTION wm_check_product_variant_value();

CREATE OR REPLACE FUNCTION wm_check_supplier_quotation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE buyer_business TEXT;
BEGIN
  SELECT "businessId" INTO buyer_business FROM "request_for_quotations" WHERE id = NEW."rfqId";
  IF buyer_business IS NULL OR buyer_business = NEW."supplierId" THEN
    RAISE EXCEPTION 'Quotation supplier must be different from the RFQ buyer business';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_supplier_quotation_business_trg"
BEFORE INSERT OR UPDATE OF "rfqId", "supplierId" ON "supplier_quotations"
FOR EACH ROW EXECUTE FUNCTION wm_check_supplier_quotation();

CREATE OR REPLACE FUNCTION wm_check_supplier_quotation_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE quotation_rfq TEXT; item_rfq TEXT;
BEGIN
  SELECT "rfqId" INTO quotation_rfq FROM "supplier_quotations" WHERE id = NEW."quotationId";
  SELECT "rfqId" INTO item_rfq FROM "rfq_items" WHERE id = NEW."rfqItemId";
  IF quotation_rfq IS NULL OR item_rfq IS NULL OR quotation_rfq <> item_rfq THEN
    RAISE EXCEPTION 'Quotation item must refer to an item in the quotation RFQ';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "wm_supplier_quotation_item_rfq_trg"
BEFORE INSERT OR UPDATE OF "quotationId", "rfqItemId" ON "supplier_quotation_items"
FOR EACH ROW EXECUTE FUNCTION wm_check_supplier_quotation_item();


-- A platform can have only one default locale at a time.
CREATE UNIQUE INDEX "locales_single_default_idx" ON "locales" ("isDefault") WHERE "isDefault" = true;

-- Positive quantities / party sizes / durations prevent nonsensical operational records.
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "restaurant_order_items" ADD CONSTRAINT "restaurant_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_party_size_positive_chk" CHECK ("partySize" > 0);
ALTER TABLE "business_order_items" ADD CONSTRAINT "business_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "supply_order_items" ADD CONSTRAINT "supply_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "supplier_quotation_items" ADD CONSTRAINT "supplier_quotation_items_quantity_positive_chk" CHECK ("quantity" > 0);
