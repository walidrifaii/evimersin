import Image from "next/image";
import { images } from "@/constants/images";
import { config } from "@/constants/config";

/**
 * Server-rendered splash that dismisses via inline script — does NOT wait
 * for React hydration (that was keeping the overlay up for seconds).
 */
export function SitePreloader() {
  return (
    <>
      <div
        id="site-preloader"
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--brand-navy)]"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="preloader-orb preloader-orb-a absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[var(--brand-blue)]/18 blur-3xl" />
          <div className="preloader-orb preloader-orb-b absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[var(--brand-red)]/14 blur-3xl" />
          <div className="preloader-grid absolute inset-0" />
        </div>

        <div className="relative flex flex-col items-center px-6">
          <p className="preloader-tagline mb-7 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/40 sm:mb-8 sm:text-[0.72rem]">
            {config.tagline}
          </p>

          <div className="preloader-logo-drawer" aria-hidden="true">
            <Image
              src={images.logoFooter}
              alt={config.appName}
              priority
              className="preloader-logo-inner h-24 w-auto sm:h-28 md:h-32 lg:h-36"
            />
          </div>

          <div className="preloader-underline mt-5 h-px w-0 bg-gradient-to-r from-transparent via-[var(--brand-red)] to-transparent sm:mt-6" />

          <p className="preloader-subtitle mt-6 text-[12px] font-medium tracking-[0.06em] text-white/35 sm:mt-7 sm:text-[13px]">
            Finding your place
          </p>

          <div className="preloader-bar-wrap mt-8 h-[2px] w-28 overflow-hidden rounded-full bg-white/10 sm:mt-9 sm:w-32">
            <div className="preloader-progress relative h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--brand-red)] via-white/90 to-[var(--brand-blue)]">
              <span className="preloader-shimmer absolute inset-y-0 left-0 w-1/3 bg-white/45" />
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var el=document.getElementById('site-preloader');
  if(!el)return;
  var done=false;
  function hide(){
    if(done)return;
    done=true;
    el.classList.add('site-preloader-exit');
    el.setAttribute('aria-busy','false');
    setTimeout(function(){
      if(el&&el.parentNode)el.parentNode.removeChild(el);
    },220);
  }
  // Hide as soon as the document can paint — never wait on React/hydration.
  if(document.readyState==='complete'||document.readyState==='interactive'){
    setTimeout(hide,180);
  }else{
    document.addEventListener('DOMContentLoaded',function(){setTimeout(hide,180);},{once:true});
  }
  setTimeout(hide,450);
})();`,
        }}
      />
    </>
  );
}
