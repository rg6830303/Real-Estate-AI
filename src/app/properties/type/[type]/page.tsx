import PropertiesBrowser from "@/components/PropertiesBrowser";
import { AGENCY_NAME } from "@/lib/config";

export const revalidate = 300;

export function generateMetadata({ params }: { params: { type: string } }) {
  return { title: `${params.type.toUpperCase()} Properties | ${AGENCY_NAME}` };
}

export default function PropertiesByType({
  params,
}: {
  params: { type: string };
}) {
  return <PropertiesBrowser type={params.type.toLowerCase()} />;
}
