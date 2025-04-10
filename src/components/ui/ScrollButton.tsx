"use client";

import React from "react";

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
}

export default function ScrollButton({
  targetId,
  children,
}: ScrollButtonProps) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center text-white hover:text-secondary transition-colors cursor-pointer bg-transparent border-none"
    >
      {children}
    </button>
  );
}
