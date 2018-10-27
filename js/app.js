(function (window, Vue, undefined) {
//在后台获得数据，使用locastorage,本地存储;其格式是json，所以需要转换格式
	new Vue ({
		el:'#app',
		data:{
			dataList:JSON.parse(window.localStorage.getItem('dataList')) || [{id:1,content:'abc',isFinish:true}],
			newTodo:'',
			beforeUpdate: null,
			activeBtn:1,
			showArr:[]
		},
		//获取数据渲染完列表之后，在修改完数组，需要将修改的数据增加到数组中，并存储到localstorage中，可以使用watch深度监听
		watch:{
			dataList:{
				//handler() watch 中的固定函数
				handler (newArr){
					window.localStorage.setItem('dataList',JSON.stringify(newArr))
					
					//需要试试监听处在哪个按钮下
					//在completed状态下，判断dataList中有isFinish为true的，没有，切换到 all列表页
					this.hashchange()
				},
				//深度监听，默认值为false
				deep:true
			}
		},
		//添加功能，1自动获取光标  
		directives:{
			focus:{
				inserted(el){
					el.focus()
				}
			},
		},
		methods:{
			//设置增加功能的点击事件
			addTodo(){
				//判断新增数据是否为空
				if(!this.newTodo.trim()){ return }
				//若有数据,将新数据增加到数据datalist数组中去
				this.dataList.unshift({
					content:this.newTodo.trim(),
					isFinish:false,
					id:this.dataList.length ? this.dataList.sort((a,b) => a.id - b.id)[this.dataList.length - 1]['id' + 1]: 1
				}),
				this.newTodo=''		
			},
			//删除功能，根据索引删除
			delTodo(index){
				this.dataList.splice(index, 1)
			},
			//footer删除全部
			delAll(){
				this.dataList = this.dataList.filter(item => !item.isFinish)
			},
			//显示编辑框
			showEdit(index){
				this.$refs.show.forEach(item => {
					item.classList.remove('editing')
				})
				this.$refs.show[index].classList.add('editing')
				//深度拷贝索要编辑的数据，并将此数据
				this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]))
			},
			//编辑内容
			updateTodo(index){
				//如果当前项的内容为空，则删除此项
				if(!this.dataList[index].content.trim())  this.dataList.splice(index, 1)		
				//若原始数据与当前数据的内容不相同，有改动，将其设为未完成状态
				//若相同，未改动，保持原样
				if(this.dataList[index].content !== this.beforeUpdate.content) this.dataList[index].isFinish = false
				this.$refs.show[index].classList.remove('editing')
				//优化操作
				this.beforeUpdate={}

			},

			//按esc键 还原
			backTodo(index){
				this.dataList[index].content = this.beforeUpdate.content
				this.$refs.show[index].classList.remove('editing')
			},
			//hashchang事件，切换三个按钮
			hashchange(){
				switch(window.location.hash){
					case '':
					case '#/':
						this.showAll()
						this.activeBtn = 1
						break;
					case '#/active':
						this.activeAll(false)
						this.activeBtn = 2
						break;
					case '#/completed':
						this.activeAll(true)
						this.activeBtn = 3
						break;

				}
			},
			//创建分类显示的数组（根据boolean）
			showAll(){
				this.showArr =this.dataList.map(()=> true)
			},
			//修改显示数组
			activeAll(boo){
				this.showArr = this.dataList.map((item)=>item.isFinish === boo)
				//判断completed页面是否还有剩余项（isFinish为false）
				if(this.dataList.every(item => item.isFinish === !boo)) {
					return window.location.hash = '#/'
				}
			}

		},
		computed:{
			activeNum(){
				return this.dataList.filter(item=> !item.isFinish).length
			},
			//设置计算属性
			toggleAll:{
				get(){
					return this.dataList.every(item=> item.isFinish)
				},
				set(val){
					this.dataList.forEach(item => item.isFinish = val)
				}
			}
		},
		//生命周期
		created(){
			this.hashchange()
			window.onhashchange = ()=> {
				this.hashchange()
			}
		}

	})

})(window, Vue);
