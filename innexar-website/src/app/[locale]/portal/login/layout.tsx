'use client';

// Login page has its own simple layout - no auth check needed
export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
