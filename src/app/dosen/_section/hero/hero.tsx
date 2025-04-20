import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="flex min-h-screen flex-col px-4 md:px-8 lg:px-16 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#004AAD] leading-[2.2] md:leading-[2.5] mt-16">
            Selamat Datang di
            <br />
            Aplikasi Pembayaran
            <br />
            Tunjangan Dosen!
          </h2>

          <div className="md:hidden mt-8">
            {/* Image Section for mobile */}
            <div className="relative w-full max-w-[300px] aspect-[5/4]">
              <Image
                src="/assets/img/hero/heroImage.png"
                alt="Hero"
                fill
                priority
                className="object-scale-down"
                sizes="100vw"
              />
            </div>
          </div>
          <p className="text-[#004AAD] max-w-[300px] mx-auto md:mx-0 mt-6 md:mt-12 text-sm sm:text-base">
            Aplikasi ini digunakan untuk memproses pengajuan pembayaran
            tunjangan profesi dan tunjangan kehormatan guru besar
          </p>
          <div className="mt-6 md:mt-10">
            <Link href="" className="inline-block">
              <button className="bg-[#FFBD59] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#FFA82C] transition-colors duration-200 text-sm sm:text-base">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Image Section for tablet and above */}
        <div className="hidden md:flex w-full md:w-1/2 justify-center items-center">
          <div className="relative w-full max-w-[500px] aspect-[5/4]">
            <Image
              src="/assets/img/hero/heroImage.png"
              alt="Hero"
              fill
              priority
              className="object-contain"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
