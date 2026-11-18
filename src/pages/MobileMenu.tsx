const assetPathPrefix = "/assets/m";
const imgClose = `${assetPathPrefix}/4b022.svg`;
const imgArrowActive = `${assetPathPrefix}/9704f.svg`;
const imgArrow = `${assetPathPrefix}/f8471.svg`;

const LINKS = ["Home", "Work", "Services", "Skills", "Experience", "Contact"] as const;
export type MenuTarget = (typeof LINKS)[number];

const display = { fontVariationSettings: '"opsz" 14, "wdth" 100' } as const;
const body = { fontVariationSettings: '"opsz" 14' } as const;

/* Full-screen menu from "Mobile · Menu (390)". */
export default function MobileMenu({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (t: MenuTarget) => void;
}) {
  return (
    <div
      className="mobile-menu fixed inset-0 z-[100] bg-[#0d1322] flex flex-col items-start justify-between pb-[28px] pt-[16px] px-[16px] overflow-y-auto"
      data-name="Mobile Menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="bg-[#172036] flex items-center justify-between pl-[10px] pr-[8px] py-[8px] rounded-[99px] shrink-0 w-full">
        <div className="flex gap-[10px] items-center">
          
<div
  className="shrink-0 size-[52px] overflow-hidden rounded-full"
  data-node-id="I1:1272;1:345"
  data-name="Logo Mark"
>
  <img
    src="/favicon.png"
    alt="Tsega Anberber"
    className="w-full h-full object-cover"
  />
</div>

          <p
            className="font-['Bricolage_Grotesque:Bold'] font-bold leading-[1.25] text-[17px] text-white tracking-[-0.136px] whitespace-nowrap"
            style={display}
          >
            Tsega Anberber
          </p>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="bg-[#3d6bff] cursor-pointer flex flex-col items-center justify-center rounded-[99px] shrink-0 size-[44px]"
        >
          <img alt="" className="size-[20px]" src={imgClose} />
        </button>
      </div>
      <nav className="flex flex-col gap-[4px] items-start pt-[24px] px-[12px] w-full shrink-0">
        {LINKS.map((label, i) => {
          const active = i === 0;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className="menu-link border-[#243049] border-solid border-t flex gap-[16px] items-center py-[14px] w-full cursor-pointer text-left"
            >
              <span
                className="font-['DM_Sans:Regular'] font-normal leading-[1.5] text-[#3d6bff] text-[14px]"
                style={body}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`flex-1 min-w-px font-['Bricolage_Grotesque:Bold'] font-bold leading-[1.06] text-[40px] tracking-[-1px] ${active ? "text-[#3d6bff]" : "text-white"}`}
                style={display}
              >
                {label}
              </span>
              <img
                alt=""
                className="size-[22px] shrink-0"
                src={active ? imgArrowActive : imgArrow}
              />
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col gap-[14px] items-start px-[12px] w-full shrink-0 pt-[24px]">
        <a
          href="mailto:Tsegaanberber07@gmail.com"
          className="font-['DM_Sans:Regular'] font-normal leading-[1.65] text-[#b4bdd3] text-[16px] break-all"
          style={body}
        >
          Tsegaanberber07@gmail.com
        </a>
        <div className="flex gap-[10px]">
          {[
            ["LinkedIn", "https://www.linkedin.com"],
            ["Telegram", "https://t.me"],
          ].map(([l, href]) => (
            <a
              key={l}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-[#243049] border-[1.4px] border-solid px-[20px] py-[11px] rounded-[99px] font-['DM_Sans:Regular'] font-normal leading-[1.5] text-[14px] text-white"
              style={body}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
