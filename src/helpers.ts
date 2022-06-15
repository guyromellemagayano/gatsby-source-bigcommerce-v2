/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { IGatsbyDataHelpers, IGatsbyNodeMetadata } from "../types/interface";
import { handleConversionObjectToString } from "./utils/convertValues";

/**
 * ============================================================================
 * Helper functions and constants
 * ============================================================================
 */
export const createNodeFromData = (
	item: object,
	nodeType: string,
	{ createNodeId, createContentDigest, createNode }: IGatsbyDataHelpers
) => {
	const nodeMetadata: IGatsbyNodeMetadata = {
		...item,
		id: createNodeId(`${nodeType}-${item.id}`),
		bigcommerce_id: item.id,
		parent: null,
		children: [],
		internal: {
			type: nodeType,
			content: handleConversionObjectToString(item),
			contentDigest: createContentDigest(item)
		}
	};

	const node = Object.assign({}, item, nodeMetadata);

	createNode(node);

	return node;
};
