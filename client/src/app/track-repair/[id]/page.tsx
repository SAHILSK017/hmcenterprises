import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function TrackRepairIdPage({ params }: Props) {
  const { id } = await params;
  redirect(`/track/${id}`);
}
