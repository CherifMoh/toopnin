module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drawlys.com', // or 'example.com',
        port: '8444',
        pathname: '/images/**',
      },
    ],
  },
}