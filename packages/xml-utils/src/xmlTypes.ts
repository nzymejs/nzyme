export type XmlAttribute = string | number | boolean;
export type XmlNode = XmlAttribute | XmlNode[] | { [key: string]: XmlNode | undefined };
export type XmlElement = { [key: string]: XmlNode };
