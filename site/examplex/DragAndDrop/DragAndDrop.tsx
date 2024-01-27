import React, {
	FC,
	useLayoutEffect,
	useRef,
	useState
} from "react"
import VirtualScrollBar from "../../../src"
import Sortable from "sortablejs"
import "./index.less"

interface ItemType {
	id: number;
	name: string;
}

let uuid = 0

export const DragAndDrop: FC = () => {
	
	const viewRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const sortableInstance = useRef<Sortable>()
	
	const [state] = useState<ItemType[]>(Array.from({length: 500}, () => {
		uuid++
		return {
			id: uuid,
			name: uuid.toString()
		}
	}))
	
	useLayoutEffect(() => {
		sortableInstance.current = Sortable.create(viewRef.current, {
			animation: 150,
			ghostClass: "ghost"
		})
	}, [])
	
	return (
		<VirtualScrollBar
			renderView={ (props) => {
				return (
					<div { ...props } ref={ viewRef }>
						{ props?.children }
					</div>
				)
			} }
		>
			{ state.map((item) => (
				<div key={ item.id } className="drag-item">{ item.name }</div>
			)) }
		</VirtualScrollBar>
	)
}

export default DragAndDrop
