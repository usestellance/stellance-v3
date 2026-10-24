"use client";
// import {
//   Calendar,
//   Home,
//   Inbox,
//   LucideLayoutDashboard,
//   Search,
// } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@repo/ui/sidebar";
import Logo from "@/components/Logo";
import { invoiceRoutes, overviewRoutes, transactionsRoutes, walletRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/features/auth/store";
import { GoQuestion } from "react-icons/go";

const overview = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g clipPath="url(#clip0_2177_1766)">
			<path
				d="M4 15.75H10C10.1358 15.75 10.25 15.8642 10.25 16V20C10.25 20.1358 10.1358 20.25 10 20.25H4C3.86421 20.25 3.75 20.1358 3.75 20V16C3.75 15.8642 3.86421 15.75 4 15.75ZM14 11.75H20C20.1358 11.75 20.25 11.8642 20.25 12V20C20.25 20.1358 20.1358 20.25 20 20.25H14C13.8642 20.25 13.75 20.1358 13.75 20V12C13.75 11.8642 13.8642 11.75 14 11.75ZM4 3.75H10C10.1358 3.75 10.25 3.86421 10.25 4V12C10.25 12.1358 10.1358 12.25 10 12.25H4C3.86421 12.25 3.75 12.1358 3.75 12V4C3.75 3.86421 3.86421 3.75 4 3.75ZM14 3.75H20C20.1358 3.75 20.25 3.86421 20.25 4V8C20.25 8.13579 20.1358 8.25 20 8.25H14C13.8642 8.25 13.75 8.13579 13.75 8V4C13.75 3.86421 13.8642 3.75 14 3.75Z"
				stroke="#000C3B"
				strokeWidth="1.5"
			/>
		</g>
		<defs>
			<clipPath id="clip0_2177_1766">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const invoiceIcon = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3 5.5C3 4.83696 3.26339 4.20107 3.73223 3.73223C4.20107 3.26339 4.83696 3 5.5 3H18C18.7956 3 19.5587 3.31607 20.1213 3.87868C20.6839 4.44129 21 5.20435 21 6V20C21 20.1779 20.9526 20.3526 20.8626 20.5061C20.7726 20.6596 20.6433 20.7863 20.488 20.8731C20.3327 20.96 20.157 21.0038 19.9791 21.0001C19.8012 20.9963 19.6275 20.9452 19.476 20.852L16.75 19.174L14.024 20.852C13.8664 20.9489 13.685 21.0003 13.5 21.0003C13.315 21.0003 13.1336 20.9489 12.976 20.852L10.25 19.174L7.524 20.852C7.37245 20.9452 7.19878 20.9963 7.02088 21.0001C6.84299 21.0038 6.66733 20.96 6.51202 20.8731C6.35672 20.7863 6.22739 20.6596 6.13738 20.5061C6.04737 20.3526 5.99995 20.1779 6 20V14H4C3.73478 14 3.48043 13.8946 3.29289 13.7071C3.10536 13.5196 3 13.2652 3 13V5.5ZM8 18.21L9.726 17.148C9.88359 17.0511 10.065 16.9997 10.25 16.9997C10.435 16.9997 10.6164 17.0511 10.774 17.148L13.5 18.826L16.226 17.148C16.3836 17.0511 16.565 16.9997 16.75 16.9997C16.935 16.9997 17.1164 17.0511 17.274 17.148L19 18.21V6C19 5.73478 18.8946 5.48043 18.7071 5.29289C18.5196 5.10536 18.2652 5 18 5H7.95C7.98333 5.162 8 5.32867 8 5.5V18.21ZM5.5 5C5.36739 5 5.24021 5.05268 5.14645 5.14645C5.05268 5.24021 5 5.36739 5 5.5V12H6V5.5C6 5.36739 5.94732 5.24021 5.85355 5.14645C5.75979 5.05268 5.63261 5 5.5 5ZM10 9C10 8.73478 10.1054 8.48043 10.2929 8.29289C10.4804 8.10536 10.7348 8 11 8H16C16.2652 8 16.5196 8.10536 16.7071 8.29289C16.8946 8.48043 17 8.73478 17 9C17 9.26522 16.8946 9.51957 16.7071 9.70711C16.5196 9.89464 16.2652 10 16 10H11C10.7348 10 10.4804 9.89464 10.2929 9.70711C10.1054 9.51957 10 9.26522 10 9ZM10 13C10 12.7348 10.1054 12.4804 10.2929 12.2929C10.4804 12.1054 10.7348 12 11 12H15C15.2652 12 15.5196 12.1054 15.7071 12.2929C15.8946 12.4804 16 12.7348 16 13C16 13.2652 15.8946 13.5196 15.7071 13.7071C15.5196 13.8946 15.2652 14 15 14H11C10.7348 14 10.4804 13.8946 10.2929 13.7071C10.1054 13.5196 10 13.2652 10 13Z"
			fill="#23252C"
		/>
	</svg>
);

const walletIcon = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M6 8H10"
			stroke="#23252C"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M20.833 9H18.231C16.446 9 15 10.343 15 12C15 13.657 16.447 15 18.23 15H20.833C20.917 15 20.958 15 20.993 14.998C21.533 14.965 21.963 14.566 21.998 14.065C22 14.033 22 13.994 22 13.917V10.083C22 10.006 22 9.967 21.998 9.935C21.962 9.434 21.533 9.035 20.993 9.002C20.959 9 20.917 9 20.833 9Z"
			stroke="#23252C"
			strokeWidth="2"
		/>
		<path
			d="M20.965 9C20.887 7.128 20.637 5.98 19.828 5.172C18.657 4 16.771 4 13 4H10C6.229 4 4.343 4 3.172 5.172C2.001 6.344 2 8.229 2 12C2 15.771 2 17.657 3.172 18.828C4.344 19.999 6.229 20 10 20H13C16.771 20 18.657 20 19.828 18.828C20.637 18.02 20.888 16.872 20.965 15"
			stroke="#23252C"
			strokeWidth="2"
		/>
		<path
			d="M17.9912 12H18.0012"
			stroke="#23252C"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const accountIcon = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g clipPath="url(#clip0_2177_1788)">
			<path
				d="M15.0931 12.3432C15.3299 12.6541 15.6381 12.9034 15.9916 13.0698C16.3452 13.2362 16.7337 13.3149 17.1241 13.2992C18.3681 13.2992 19.3781 12.5422 19.3781 11.6082C19.3781 10.6742 18.3681 9.9182 17.1241 9.9182C15.8801 9.9182 14.8691 9.1602 14.8691 8.2262C14.8691 7.2922 15.8791 6.5352 17.1241 6.5352M17.1241 6.5352C17.5146 6.51951 17.9031 6.59821 18.2566 6.76463C18.6102 6.93105 18.9184 7.18029 19.1551 7.4912M17.1241 6.5352V5.4082M17.1241 13.3002V14.4262"
				stroke="#23252C"
				// stroke="#00000050"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 18.25V21.75M7 21.75H17M4.622 6.689H10.634M4.622 10.515H10.634M4.622 14.341H7.628M20.354 2.25H3.646C2.94424 2.25 2.27122 2.52877 1.775 3.025C1.27877 3.52122 1 4.19424 1 4.896V15.604C1 16.3058 1.27877 16.9788 1.775 17.475C2.27122 17.9712 2.94424 18.25 3.646 18.25H20.354C20.7015 18.25 21.0455 18.1816 21.3666 18.0486C21.6876 17.9156 21.9793 17.7207 22.225 17.475C22.4707 17.2293 22.6656 16.9376 22.7986 16.6166C22.9316 16.2956 23 15.9515 23 15.604V4.896C23 4.54852 22.9316 4.20445 22.7986 3.88342C22.6656 3.56239 22.4707 3.2707 22.225 3.025C21.9793 2.77929 21.6876 2.58439 21.3666 2.45141C21.0455 2.31844 20.7015 2.25 20.354 2.25Z"
				stroke="#23252C"
				// stroke="#00000080"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</g>
		<defs>
			<clipPath id="clip0_2177_1788">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const signOutIcon = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M10 20C4.5 20 4 19 4 12C4 5 4.5 4 9.99999 4"
			stroke="#B40000"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 12L20 12"
			stroke="#B40000"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M16 16L20 12L16 8"
			stroke="#B40000"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// Menu items.
const items = [
	{
		title: "Overview",
		url: overviewRoutes.OVERVIEW,
		icon: overview,
		active: true,
	},
	{
		title: "Invoices",
		url: invoiceRoutes.INVOICES,
		icon: invoiceIcon,
		active: true,
	},
	{
		title: "Wallet",
		url: walletRoutes.WALLET,
		icon: walletIcon,
		active: true,
	},
	{
		title: "Transactions",
		url: transactionsRoutes.TRANSACTIONS,
		icon: accountIcon,
		active: false,
	},
];

export function AppSidebar() {
	const pathname = usePathname();
	const { setOpenMobile, isMobile } = useSidebar(); // Get sidebar controls
	const logout = useLogout();
	// const toast = useToast();
	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false); // Close sidebar on mobile
		}
	};
	// const handleToast = () => {
	// 	toast.info("Coming Soon");
	// };

	return (
		<Sidebar
			className="bg-neutral-500 shadow-md  rounded-tr-[20px] rounded-br-[20px]
    md:rounded-tr-[20px] md:rounded-br-[20px] z-50"
		>
			<SidebarHeader className="bg-neutral-500">
				<div className="flex justify-center my-10 flex-col items-center">
					<Logo
						link={overviewRoutes.OVERVIEW}
						height="h-[30px] md:h-[40px] lg:h-[72px]"
					/>
					<p className="font-bold max-md:hidden lg:text-lg lg:-ml-2">
						Stellance
					</p>
				</div>
			</SidebarHeader>
			<SidebarContent className="bg-neutral-500 px-1">
				<SidebarMenu className="h-full">
					{items
						// .filter((item) => (item.active ? item : null))
						.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									isActive={pathname.includes(item.url)}
									asChild
								>
									<Link
										href={item.url}
										onClick={handleLinkClick} // Add click handler
										className="h-[43px] flex items-center rounded-md transition-all data-[active=true]:bg-primary-50 data-[active=true]:text-primary-600 data-[active=true]:font-bold text-[20px] gap-4"
									>
										<div className="flex ml-3 md:ml-8">{item.icon}</div>

										<span className="inline-block">{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					{/* <SidebarMenuItem>
						<SidebarMenuButton
							// isActive={pathname.includes(item.url)}
							asChild
						>
							<Link
								href="#"
								onClick={handleToast} // Add click handler
								className="h-[43px] flex items-center rounded-md transition-all data-[active=true]:bg-primary-50 data-[active=true]:text-primary-600 text-black/50 data-[active=true]:font-bold text-[20px] gap-4"
							>
								<div className="ml-3 md:ml-8">{accountIcon}</div>
								<span>Transactions</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem> */}
					<SidebarMenuItem className="mt-auto align-self-end">
						<SidebarFooter className="bg-pink400 flex pb-10 gap-4">
							<SidebarMenuButton asChild className="">
								<Link
									href="mailto:admin@usestellance.com"
									className="h-[43px] flex items-center rounded-md transition-all data-[active=true]:bg-primary-50 data-[active=true]:text-primary-600 data-[active=true]:font-bold  cursor-pointer"
								>
									<span className="text-[20px] ml-6 md:ml-8">Support</span>
									<GoQuestion className="text-lg" />
								</Link>
							</SidebarMenuButton>
							<SidebarMenuButton asChild className="">
								<div
									onClick={logout} // Add click handler
									className="h-[43px] flex items-center rounded-md transition-all data-[active=true]:bg-primary-50 data-[active=true]:text-primary-600 data-[active=true]:font-bold text-[20px] text-error-400 cursor-pointer"
								>
									<div className="ml-3 md:ml-5">{signOutIcon}</div>
									<span>Sign Out</span>
								</div>
							</SidebarMenuButton>
						</SidebarFooter>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
