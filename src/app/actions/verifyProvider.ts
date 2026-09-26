"use server"

import { verifyNpi } from "../../lib/npi/verifyNpi";

export async function verifyProvider(providerData: {
  first_name: string;
  last_name: string;
  npi: string;
  specialty: string;
}) {
  return await verifyNpi(providerData);
}
