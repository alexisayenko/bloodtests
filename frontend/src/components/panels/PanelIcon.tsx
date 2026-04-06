import type { Panel } from '../../types';

export function PanelIcon({ panel }: { panel: Panel }) {
  if (panel.iconFile) {
    return (
      <span
        className="panel-icon-mask"
        style={{
          WebkitMaskImage: `url(./icons/${panel.iconFile})`,
          maskImage: `url(./icons/${panel.iconFile})`,
        }}
      />
    );
  }
  if (panel.icon) {
    return <span className="panel-icon" dangerouslySetInnerHTML={{ __html: panel.icon }} />;
  }
  return null;
}
