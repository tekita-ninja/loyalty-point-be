-- AddForeignKey
ALTER TABLE "customer_point" ADD CONSTRAINT "customer_point_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
