import { TFunction } from "i18next";

function buildColorCodedItem(
  text: string,
  t: TFunction<string>,
  index: number,
) {
  const colorMatchRegex = /#{(\w*)}/;
  const translationMatchRegex = /^[^#]*{([A-Z[a-z]*)}$/;

  const spanContent = text.split(" ").map((x, i) => {
    const colorMatch = x.match(colorMatchRegex);
    if (colorMatch !== null) {
      const color = colorMatch[1].toUpperCase();
      return (
        <span
          key={i}
          title={t(color)}
          className={`box ${color.toLowerCase()}`}
        ></span>
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
      <p className="color-coded-item-text">{spanContent}</p>
    </div>
  );
}

export default function colorCodedElement(text: string, t: TFunction<string>) {
  const itemGroupsRegex = /\[([\w\d ()#{}]*)\]*/g;

  const groups = [...text.matchAll(itemGroupsRegex)].map((x) => x[1]);

  if (groups.length === 0) {
    return (
      <div className="color-coded">
        <div className="color-coded-item">
          <p>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="color-coded">
      {groups.map((x, i) => {
        return buildColorCodedItem(x, t, i);
      })}
    </div>
  );
}
