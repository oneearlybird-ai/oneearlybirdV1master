import Logo from './logo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12">

          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-4 order-1 lg:order-none">
            <div className="mb-4">
              <div className="mb-4">
                <Logo />
              </div>
              <div className="text-sm text-slate-300">© {year} EarlyBird AI. All rights reserved.</div>
            </div>
          </div>

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Products</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/how-it-works">Features</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/integrations">Integrations</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/pricing">Pricing & Plans</a>
              </li>
            </ul>
          </div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Company</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/about">About</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/support">Support</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="mailto:hello@earlybird.ai">Contact</a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Resources</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/docs">Docs</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/status">Status</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/support/porting">Number porting</a>
              </li>
            </ul>
          </div>

          {/* 5th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Legals</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/terms">Terms & Conditions</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/privacy">Privacy policy</a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  )
}
