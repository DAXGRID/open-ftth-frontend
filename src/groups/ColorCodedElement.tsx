import { TFunction } from "i18next";

function buildColorCodedItem(
  text: string,
  t: TFunction<string>,
  index: number,
) {
  const colorMatchRegex = /#{(\w*)}/;
  const translationMatchRegex = /^[^#]*{([A-Za-z1-9]*)}$/;

  const spanContent = text.split(" ").map((x, i) => {
    const colorMatch = x.match(colorMatchRegex);
    if (colorMatch !== null) {
      const color = colorMatch[1].toUpperCase();
      const colorText = `${color}_TEXT`;
      return (
        <div className="box-color-container" key={i}>
          <div title={t(colorText)} className={`box ${color.toLowerCase()}`}>
            <div className="box-single-stripe"></div>
            <div className="box-double-stripe"></div>
          </div>
        </div>
      );
    }

    const translationMatch = x.match(translationMatchRegex);
    if (translationMatch !== null) {
      return <span key={i}>{t(translationMatch[1])}</span>;
    }

    return <span key={i}>{x}</span>;
  });

  return (
    <div key={index} className="color-coded-item">
      <div className="color-coded-item-text">{spanContent}</div>
    </div>
  );
}

export default function ColorCodedElement(text: string, t: TFunction<string>) {
  const itemGroupsRegex = /\[([\w\d ()#{}]*)\]*/g;

  const groups = [...text.matchAll(itemGroupsRegex)].map((x) => x[1]);

  if (groups.length === 0) {
    return (
      <div className="color-coded">
        <div className="color-coded-item">
          <div>{text}</div>
        </div>
      </div>
    );
  }

  console.log(groups);

  return (
    <div className="color-coded">
      {groups.map((x, i) => {
        return buildColorCodedItem(x, t, i);
      })}
    </div>
  );
}
