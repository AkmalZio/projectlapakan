/**
 * Building blocks shared by the auth pages so they match the Login / Register design.
 */
export function AuthHeader({ title, description }) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b1f3f]">LAPAKan</p>
            <h1 className="text-3xl font-black text-[#2d1a1f]">{title}</h1>
            {description && <p className="text-sm leading-6 text-[#67595d]">{description}</p>}
        </div>
    );
}

export function AuthStatus({ children }) {
    return (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {children}
        </div>
    );
}

export function AuthInput({ id, label, icon: Icon, error, ...props }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-bold text-[#3a2b2f]">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#8b1f3f]" />}
                <input
                    id={id}
                    name={id}
                    {...props}
                    className={`w-full rounded-xl border border-[#dbc7a5] bg-white py-3 pr-4 text-sm text-[#2a1d20] placeholder:text-[#7f6a70] focus:border-[#8b1f3f] focus:outline-none focus:ring-2 focus:ring-[#8b1f3f]/15 ${
                        Icon ? 'pl-10' : 'pl-4'
                    }`}
                />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function AuthSubmitButton({ processing, children, processingLabel = 'Memproses...' }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="w-full rounded-xl bg-[#7d0f2e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#99183d] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {processing ? processingLabel : children}
        </button>
    );
}
