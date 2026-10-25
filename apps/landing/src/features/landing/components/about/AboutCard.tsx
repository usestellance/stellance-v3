import Image from "next/image";
import React from "react";

const AboutCard = ({
  className,
  imgClassName = "",
  img,
  text,
  title,
}: {
  className: string;
  imgClassName?: string;
  img: string;
  title: string;
  text: string;
}) => {
  return (
    <div
      data-about-card
      className={`${className} bg-neutral-500 hover:shadow-lg duration-150 transition-[box-shadow] outline-[0.5px] outline outline-primary-500/50 px-5 py-[30px] lg:px-[37px] lg:py-[33px] rounded-[15px] flex flex-col gap-[30px] md:gap-[50px]`}
    >
      <div className="rounded-[15px] overflow-hidden h-[323px]">
        <Image
          alt={title}
          height={500}
          width={500}
          src={img}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      </div>
      <div className="">
        <h4 className="font-bold md:text-2xl lg:text-[32px] leading-[1.1]">{title.toUpperCase()}</h4>
        <p className="text-neutral-900 mt-5 md:text-lg lg:text-2xl tracking-[0.01em] md:text-black-400/85">
          {text}
        </p>
      </div>
    </div>
  );
};

export default AboutCard;
