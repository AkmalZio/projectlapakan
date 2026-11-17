import { Component } from 'react';

/**
 * Catches render errors anywhere in the page tree so a crash shows a recoverable message
 * instead of a blank white screen.
 */
export default class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('LAPAKan render error:', error, info?.componentStack);
    }

    render() {
        const { error } = this.state;

        if (!error) {
            return this.props.children;
        }

        return (
            <main className="flex min-h-screen items-center justify-center bg-[#faf6f0] px-4">
                <div role="alert" className="w-full max-w-md rounded-2xl border border-[#eadfcd] bg-white p-6 text-center shadow-sm">
                    <h1 className="text-lg font-bold text-[#3d1725]">Halaman ini mengalami kendala</h1>
                    <p className="mt-2 text-sm text-[#746b64]">
                        Coba muat ulang halaman. Jika masih terjadi, kembali ke beranda dan ulangi langkahmu.
                    </p>
                    {import.meta.env.DEV && (
                        <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-800">
                            {String(error?.message ?? error)}
                        </pre>
                    )}
                    <div className="mt-5 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-crimson-800 px-4 py-2 text-sm font-bold text-white hover:bg-crimson-700"
                        >
                            Muat ulang
                        </button>
                        <a href="/" className="rounded-xl border border-[#eadfcd] px-4 py-2 text-sm font-semibold text-[#3d1725] hover:bg-[#faf6f0]">
                            Ke beranda
                        </a>
                    </div>
                </div>
            </main>
        );
    }
}
