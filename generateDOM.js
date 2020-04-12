( generateDOM => {

  window.generateDOM = generateDOM

} )( ( dom, append = document.body ) => {
  // 解析标签名
  function parseTagNmae ( s ) {
    const REG = /^[a-z]+/

    return REG.test( s ) ? REG.exec( s )[ 0 ] : ''
  }

  // 解析 class
  function parseClass ( s ) {
    const CLAS = []

    // 解析 .uc1 格式
    // class 格式有英文、数字、下划线和中划线
    let reg1 = /\.([\w-]+)/g
    let tmp1 = ''

    while ( ( tmp1 = reg1.exec( s ) ) !== null ) {
      CLAS.push( tmp1[ 1 ] )
    }

    // 解析 .[uc1, uc2] 格式
    let reg2 = /\.\[(.*?)\]/g
    let tmp2 = ''

    while ( ( tmp2 = reg2.exec( s ) ) !== null ) {
      tmp2[ 1 ].split( ',' ).map( item => CLAS.push( item.trim() ) )
    }

    // 如果没有指定类，就返回空字符
    if ( !( reg1.test( s ) || reg2.test( s ) ) ) {
      return ''
    } else {
      return CLAS.join( ' ' )
    }
  }

  // 解析 id
  function parseId ( s ) {
    const REG = /#([\w-]+)/

    return REG.test( s ) ? REG.exec( s )[ 1 ] : ''
  }

  // 解析属性
  function parseAttr ( s ) {
    const REG = /%{(.*?)}/g
    const RESULTS = {}
    let tmp = ''

    while ( ( tmp = REG.exec( s ) ) !== null ) {
      tmp[ 1 ].split( ',' ).forEach( item => {
        item = item.trim().replace( ': ', '$' ).split( '$' )
        RESULTS[ item[ 0 ] ] = item[ 1 ]
      } )
    }

    return REG.test( s ) ? RESULTS : ''
  }

  // 解析文本
  function parseText ( s ) {
    const REG = /@'(.+?)'/g
    let tmp = ''
    let str = ''

    while ( ( tmp = REG.exec( s ) ) !== null ) {
      str += tmp[ 1 ]
    }

    return REG.test( s ) ? str : ''
  }

  // 解析数量
  function parseCount ( s ) {
    const REG = /\*(\d+)/

    return REG.test( s ) ? REG.exec( s )[ 1 ] : 1
  }

  // 分离每个节点（节点=标签名+属性）（还未解析的字符串）
  const NODE = dom.split( '>' ).map( item => item.trim() )
  // 提取标签名
  const TAGS = NODE.map( item => parseTagNmae( item ) )
  // 提取属性
  const PROPS = NODE.map( ( item, index ) => item.replace( TAGS[ index ], '' ) )
  // 待追加池，池子里的元素都是要追加到父标签内的
  const POOL = []

  // 从最最最小辈（孙子到不能再孙子）开始添加特性等操作
  // 根据指定的生成数量，生成 DOM 节点，最后全部放进池子中
  function render ( tag, prop ) {
    // 备份追加池，并清空追加池
    const COPYPOOL = POOL.map( item => item )
    POOL.length = 0

    // 解析属性
    const CLASSVALUE = parseClass( prop )
    const IDVALUE = parseId( prop )
    const ATTR = parseAttr( prop )
    const TEXT = parseText( prop )
    const COUNT = Number( parseCount( prop ) )

    // 生成几个标签，就遍历几次
    for ( let i = 0; i < COUNT; i++ ) {
      const EL = document.createElement( tag )
      // 添加属性
      CLASSVALUE ? EL.setAttribute( 'class', CLASSVALUE ) : undefined
      IDVALUE ? EL.setAttribute( 'id', IDVALUE ) : undefined
      for ( let i in ATTR ) {
        // 如果使用 setAttribute 来设置 class 的话，那么之前设置的 class 都会被删掉，然后重新设置 class
        if ( i === 'class' ) {
          EL.classList.add( ATTR[ i ] )
        } else {
          EL.setAttribute( i, ATTR[ i ] )
        }
      }
      TEXT ? EL.textContent = TEXT : undefined

      // 将追加池中的节点的副本追加到 EL 节点内
      COPYPOOL.forEach( item => EL.appendChild( item.cloneNode( true ) ) )

      // 把完善的节点放进追加池内
      POOL.push( EL )
    }
  }

  // 整一个递归函数，只有当 TAGS 的长度为空时才结束
  function main () {
    if ( TAGS.length ) {
      render( TAGS.pop(), PROPS.pop() )
      main()
    } else {
      // 把最终的节点追加到 node 节点中
      POOL.forEach( item => append.appendChild( item ) )
    }
  }

  main()
} )
