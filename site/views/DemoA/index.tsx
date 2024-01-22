import React from "react"
import Shadow from "../../examplex/Shadow"
import RandomHeight from "../../examplex/RandomHeight"
import DragAndDrop from "../../examplex/DragAndDrop"
import CustomStyles from "../../examplex/CustomStyles"
import Container from "../../components/Container"
import styles from "./index.module.less"
import GithubIcon from "./Github"

function Index() {
	
	return (
		<div className={ styles.layout }>
			<div className={ styles.layoutWrapper }>
				<div className={styles.layoutHeader}>React 版本滚动条 <a href="https://github.com/kampiu/better-scrollbar"><GithubIcon /></a></div>
				<div>
					滚动原理参考 <a href="https://github.com/malte-wessel/react-custom-scrollbars">react-custom-scrollbars</a> ，其中针对虚拟滚动以及原仓库中的issue有针对性改动。
				</div>
			</div>
			<div className={ styles.layoutSection }>
				<div className={ styles.layoutHeader }>案例</div>
				
				<div className={ styles.containerWrapper }>
					<Container
						title="动态高度"
						desc="满足items动态高度，支持动态修改items数量，减轻使用成本。"
						className={ styles.container }
					>
						<RandomHeight />
					</Container>
					<Container
						title="阴影滚动条"
						desc="当滚动条隐藏场景下可通过阴影效果提示滚动区域内存在部分内容被遮挡，可通过滚动预览更多内容。"
						className={ styles.container }
					>
						<Shadow />
					</Container>
					<Container
						title="拖拽"
						desc="结合SortableJs实现拖拽排序。"
						className={ styles.container }
					>
						<DragAndDrop />
					</Container>
					<Container
						title="高度自定义样式"
						desc="自定义滚动容器、滚动条等。"
						className={ styles.container }
					>
						<CustomStyles />
					</Container>
				</div>
			</div>
			{/*<div className={ styles.layoutSection }>*/}
			{/*	<div className={ styles.layoutHeader }>使用</div>*/}
			{/*</div>*/}
		
		</div>
	)
}

export default Index
