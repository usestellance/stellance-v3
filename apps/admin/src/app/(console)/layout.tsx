import { AdminShell } from "@/components/AdminShell";
import { RequireAdmin } from "@/features/auth/RequireAdmin";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<RequireAdmin>
			<AdminShell>{children}</AdminShell>
		</RequireAdmin>
	);
}
