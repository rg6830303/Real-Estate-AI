import PropertiesBrowser from "@/components/PropertiesBrowser";
import { AGENCY_NAME } from "@/lib/config";

export const revalidate = 300;

export function generateMetadata({ params }: { params: { location: string } }) {
  const label = params.location.charAt(0).toUpperCase() + params.location.slice(1);
  return { title: `Properties in ${label} | ${AGENCY_NAME}` };
}

export default function PropertiesByLocation({
  params,
}: {
  params: { location: string };
}) {
  return <PropertiesBrowser location={params.location.toLowerCase()} />;
}
