import Image from "next/image";
import Link from "next/link";
import { Belleza, Cinzel, Inter } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const belleza = Belleza({
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const menuItems = [
  {
    name: "Dimsum Mentai Torch",
    detail: "6 pcs",
    description:
      "Dimsum lembut dengan mentai creamy, ditorch sampai wangi smoky.",
    price: "Rp23.000",
    image: "/dimsum6pcs.webp",
  },
  {
    name: "Additional Chili Oil",
    detail: "Add-on",
    description:
      "Chili oil gurih-pedas untuk yang suka rasa lebih nendang.",
    price: "Rp2.000",
    image: "/chilioil.webp",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${inter.className} min-h-screen overflow-hidden bg-[#FFF7EF] text-[#2A1810]`}
    >
      <section className="relative min-h-screen px-5 py-4 md:px-10">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-[#F2B36B]/30 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-[#c61b16]/20 blur-3xl" />

          <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/baomilogo.webp"
              alt="Baomi Dimsum"
              width={150}
              height={48}
              priority
              className="w-[130px] md:w-[150px]"
              style={{ height: "auto" }}
            />
          </Link>
 
          <Link
            href="/order"
            className="rounded-full border border-[#c61b16]/25 bg-white/70 px-5 py-2.5 text-sm font-bold text-[#c61b16] shadow-sm backdrop-blur transition duration-200 hover:from-[#E65A4A] hover:to-[#C61B16] hover:bg-gradient-to-r hover:text-white transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#C61B16]/20"
          >
            Order
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-152px)] max-w-6xl items-center gap-12 py-14 lg:grid-cols-[1fr_0.95fr]">
          <div>
            

            <h1
              className={`${cinzel.className} max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-[#2A1810] md:text-7xl lg:text-8xl`}
            >
              More Sauce.
              <br />
              More Bites.
            </h1>

            <p
              className={`${belleza.className} mt-6 max-w-xl text-2xl leading-9 text-[#6B4B3B] md:text-3xl`}
            >
              Dimsum mentai torch yang creamy, smoky, dan saucy dalam satu
              gigitan.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#7A5A49]">
              BAOMI dibuat untuk kamu yang suka dimsum dengan rasa lebih bold:
              mentai yang melimpah, aroma torch yang khas, dan opsi chili oil
              untuk sentuhan pedas gurih.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/order"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E14B3C] to-[#C61B16] px-7 py-4 font-extrabold text-white shadow-lg shadow-[#C61B16]/30 transform transition duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#C61B16]/25"
              >
                Order Sekarang
              </Link>

              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-2xl border border-[#E8CDBB] bg-white px-7 py-4 font-bold text-[#2A1810] transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C61B16]/10"
              >
                Lihat Menu
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute left-8 top-8 h-full w-full rounded-[2.5rem] bg-[#c61b16]/15" />

            <div className="relative rounded-[2.5rem] border border-[#F0D2BE] bg-white p-5 shadow-2xl shadow-[#c61b16]/10">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#FFF0E7]">
                <Image
                  src="/dimsumkatalog.webp"
                  alt="Dimsum Mentai Torch 6 pcs"
                  width={720}
                  height={720}
                  priority
                  className="aspect-square w-full object-cover"
                />

              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p
                    className={`${belleza.className} text-2xl text-[#2A1810]`}
                  >
                    Dimsum Mentai Torch
                  </p>
                  <p className="mt-1 text-sm text-[#7A5A49]">
                    Creamy mentai, smoky torch, saucy finish.
                  </p>
                </div>

                <p className="shrink-0 text-xl font-extrabold text-[#c61b16]">
                  Rp23K
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden max-w-[210px] rounded-3xl border border-[#E8CDBB] bg-white p-4 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <Image
                  src="/chilioil.webp"
                  alt="Additional Chili Oil"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-sm font-extrabold">Chili Oil</p>
                  <p className="text-xs text-[#7A5A49]">Add-on Rp2.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p
              className={`${belleza.className} text-sm tracking-[0.3em] text-[#c61b16]`}
            >
              BAOMI MENU
            </p>

            <h2
              className={`${cinzel.className} mt-3 text-4xl font-bold tracking-[-0.03em] md:text-5xl`}
            >
              Simple menu, bold flavor.
            </h2>

            
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="group overflow-hidden rounded-[2rem] border border-[#E8CDBB] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c61b16]/10"
              >
                <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                  <div className="relative min-h-[220px] overflow-hidden bg-[#FFF0E7] sm:min-h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={360}
                      height={360}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c61b16]">
                        {item.detail}
                      </p>

                      <h3
                        className={`${belleza.className} mt-3 text-3xl text-[#2A1810]`}
                      >
                        {item.name}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-[#7A5A49]">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-2xl font-extrabold text-[#c61b16]">
                        {item.price}
                      </p>

                      <Link
                        href="/order"
                        className="rounded-full bg-[#2A1810] px-5 py-2.5 text-sm font-bold text-white transition duration-200 hover:bg-[#C61B16] hover:scale-105 shadow-sm transform focus:outline-none focus:ring-2 focus:ring-[#C61B16]/20"
                      >
                        Pilih
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] bg-[#2A1810] p-6 text-white md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p
                  className={`${belleza.className} text-sm tracking-[0.25em] text-[#F2B36B]`}
                >
                  LIMITED BATCH
                </p>

                <h2
                  className={`${cinzel.className} mt-3 text-3xl font-bold md:text-4xl`}
                >
                  Open order per batch.
                </h2>

                
              </div>

              <Link
                href="/order"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E14B3C] to-[#C61B16] px-7 py-4 font-bold text-white shadow-lg shadow-[#C61B16]/30 transform transition duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#C61B16]/25"
              >
                Masuk Form Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}