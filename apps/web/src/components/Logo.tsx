import { withBasePath } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";

const Logo = ({
  height = "h-[30px]",
  link,
}: {
  height?: string;
  link: string;
}) => {
  return (
    <Link href={link || "/"}>
      <div className={`${height} w-fit bgred-400`}>
        <Image
          src={withBasePath("/images/logo-primary.svg")}
          alt="Stellance Logo"
          width={100}
          loading="eager"
          height={100}
          className="h-full w-full object-contain"
        />
      </div>
    </Link>
  );
};

export default Logo;
