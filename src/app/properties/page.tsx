import PropertiesBrowser from "@/components/PropertiesBrowser";
import { AGENCY_NAME } from "@/lib/config";

export const revalidate = 300;

export const metadata = {
  title: `Properties | ${AGENCY_NAME}`,
};

export default function PropertiesPage() {
  return <PropertiesBrowser />;
}
