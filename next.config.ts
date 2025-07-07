import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Amazon image domains
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-eu.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-fe.ssl-images-amazon.com',
      },
      // Flipkart image domains
      {
        protocol: 'https',
        hostname: 'rukminim1.flixcart.com',
      },
      {
        protocol: 'https',
        hostname: 'rukminim2.flixcart.com',
      },
      {
        protocol: 'https',
        hostname: 'rukminim3.flixcart.com',
      },
      // eBay image domains
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs1.ebaystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs2.ebaystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs3.ebaystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs4.ebaystatic.com',
      },
      // Shopee image domains
      {
        protocol: 'https',
        hostname: 'cf.shopee.sg',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.com.my',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.ph',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.co.th',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.vn',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.co.id',
      },
      {
        protocol: 'https',
        hostname: 'cf.shopee.com.br',
      },
      // Lazada image domains
      {
        protocol: 'https',
        hostname: 'static-01.daraz.pk',
      },
      {
        protocol: 'https',
        hostname: 'static-01.daraz.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'lzd-img-global.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'my-live-02.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'sg-live.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'th-live.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'vn-live.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'ph-live.slatic.net',
      },
      {
        protocol: 'https',
        hostname: 'id-live.slatic.net',
      },
      // Google Shopping (for generic scraper)
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
      },
      // Wildcard patterns for common CDNs
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
