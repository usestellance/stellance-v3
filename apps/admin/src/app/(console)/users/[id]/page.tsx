import type { Metadata } from "next";
import { UserDetailView } from "@/features/admin/components/UserDetailView";

export const metadata: Metadata = { title: "User" };

export default async function Page({ params }: PageProps<"/users/[id]">) {
	const { id } = await params;
	return <UserDetailView id={id} />;
}
