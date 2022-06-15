interface IGatsbyNodeMetadataInternal {
	type: string;
	content: string;
	contentDigest: string;
}

export interface IGatsbyDataHelpers {
	createNodeId: (...args: never[]) => string;
	createContentDigest: (...args: never[]) => string;
	createNode: (...args: never[]) => void;
}

export interface IGatsbyNodeMetadata {
	id: string;
	bigcommerce_id: number;
	parent: null;
	children: string[];
	internal: IGatsbyNodeMetadataInternal;
}
