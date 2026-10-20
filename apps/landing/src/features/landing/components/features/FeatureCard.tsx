import Image from "next/image";
import React from "react";

const FeatureCard = ({
  className,
  img,
  text,
  title,
}: {
  className: string;
  img: string;
  title: string;
  text: string;
}) => {
  return (
    <div
      data-feature
      className={`${className} border border-primary-500/50 px-6 lg:p-[60px] py-[30px] rounded-tl-[15px] rounded-tr-[15px] flex flex-col gap-[30px] md:gap-[50px] max-md:bg-linear-to-tr max-md:from-[#dee4fa] max-md:to-neutral-500 max-md:min-h-[490px] max-md:-mt-10 md:rounded-none md:border-none`}
    >
      <div data-feature-copy>
        <h4 className="font-bold lg:text-[32px] ">{title.toUpperCase()}</h4>
        <p className="text-neutral-900 mt-5 lg:text-2xl md:text-black-400">
          {text}
        </p>
      </div>
      <div data-feature-image className="h-[187px] w-full min-w-0 md:max-w-[800px] lg:h-[300px]">
        <Image
          alt=""
          height={500}
          width={500}
          src={img}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default FeatureCard;
