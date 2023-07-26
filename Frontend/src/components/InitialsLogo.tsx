import React from 'react';
const generateColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  const color = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return color;
};
const getInitials = (name: string) => {
  let initials;
  const nameSplit = name.split(' ');
  const nameLength = nameSplit.length;
  if (nameLength > 1) {
    initials =
      nameSplit[0].substring(0, 1) + nameSplit[nameLength - 1].substring(0, 1);
  } else {
    initials = nameSplit[0].substring(0, 1);
  }
  return initials.toUpperCase();
};
export const ImageFromInitials = ({
  size,
  name,
}: {
  size: number;
  name: string;
}) => {
  if (name == null) return <></>;
  const color = generateColorFromName(name);
  name = getInitials(name);
  const divStyle = {
    marginRight: '10px',
    width: size + 'px',
    height: size + 'px',
    borderRadius: '50%',
    backgroundColor: `${color}50`,
    color: color,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: size / 2,
    fontFamily: 'Roboto',
  };
  return <div style={divStyle}>{name}</div>;
};
