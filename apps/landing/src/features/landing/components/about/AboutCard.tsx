import Image from "next/image";
import React from "react";

const AboutCard = ({
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
      data-about-card
      className={`${className} hover:shadow-lg duration-150 hover:border-neutral-500 transition-[box-shadow,border-color] border border-primary-500/50 px-5 py-[30px] rounded-[10px] flex flex-col gap-[30px] md:gap-[50px]`}
    >
      <div className="rounded-[15px] overflow-hidden h-[323px]">
        <Image
          alt={title}
          height={500}
          width={500}
          src={img}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="">
        <h4 className="font-bold lg:text-[32px] ">{title.toUpperCase()}</h4>
        <p className="text-neutral-900 mt-5 lg:text-2xl md:text-black-400">
          {text}
        </p>
      </div>
    </div>
  );
};

export default AboutCard;
