"use client";
import { useRouter } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";

const GoBack = () => {
  const router = useRouter();

  return (
    <BiArrowBack
      className="text-[24px] md:text-[36px] cursor-pointer"
      onClick={() => router.back()}
    />
  );
};

export default GoBack;
