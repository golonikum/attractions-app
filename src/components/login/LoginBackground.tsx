import Image from 'next/image';

import authBg from '@/assets/auth-bg.jpg';

export default function LoginBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#9ba5a6]">
      <Image
        src={authBg}
        alt=""
        fill
        sizes="100vw"
        quality={60}
        placeholder="blur"
        loading="eager"
        fetchPriority="high"
        className="object-cover object-[center_60%]"
      />
      {/* лёгкое затемнение, чтобы форма читалась на ярком небе */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
