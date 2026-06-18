"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LastOrder = {
  orderId?: string;
  nama?: string;
  totalBayar?: number;
  tipeDelivery?: string;
};

function formatRupiah(value?: number) {
  if (!value) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("baomi_last_order");

    if (raw) {
      try {
        setOrder(JSON.parse(raw));
      } catch {
        setOrder(null);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f2ec] px-5 py-10 text-[#cc1915]">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#cc1915] text-4xl text-white">
          ✓
        </div>

        <p className="mb-2 text-sm uppercase tracking-[0.35em]">
          Order Submitted
        </p>

        <h1 className="mb-4 text-4xl font-semibold tracking-wide">
          Thank You!
        </h1>

        <p className="mb-8 text-sm leading-6 text-neutral-700">
          Pesanan kamu sudah berhasil dikirim. Tim BAOMI akan melakukan
          pengecekan pembayaran dan menghubungi kamu melalui WhatsApp.
        </p>

        <div className="mb-8 w-full rounded-3xl border border-[#cc1915]/20 bg-white/70 p-5 text-left shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">Order ID</span>
            <span className="text-sm font-semibold text-neutral-900">
              {order?.orderId || "-"}
            </span>
          </div>

          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">Nama</span>
            <span className="text-sm font-semibold text-neutral-900">
              {order?.nama || "-"}
            </span>
          </div>

          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">Total Bayar</span>
            <span className="text-sm font-semibold text-neutral-900">
              {formatRupiah(order?.totalBayar)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">Pengiriman</span>
            <span className="text-sm font-semibold text-neutral-900">
              {order?.tipeDelivery || "-"}
            </span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Link
            href="/order"
            className="block rounded-full bg-[#cc1915] px-5 py-3 text-sm font-semibold text-white"
          >
            Buat Order Lagi
          </Link>

          <Link
            href="/"
            className="block rounded-full border border-[#cc1915] px-5 py-3 text-sm font-semibold text-[#cc1915]"
          >
            Kembali ke Home
          </Link>
        </div>
      </section>
    </main>
  );
}