$(document).ready(function () {
  //设置初始video配置
  $('video source').attr('src', $('.coverList li').eq(0).find('img').data('url'))
  const oneTitle = $('.coverList li').eq(0).find('h4').text()
  $('.plyr.plyr--video').append(`<div class="plyr__title">${oneTitle}</div>`)
  console.log($('.coverList li').eq(0).data('all'));
  const player = window.player
  setTimeout(() => {
    $("video").show()
  }, 500)
  // 给li列表添加点击事件,鼠标划入选择封面事件
  liClick()

  let listData = [], initData = []
  layui.use(['form', 'layer'], function () {
    const form = layui.form;
    const layer = layui.layer;
    form.on('select(college)', function (data) {
      listData = []
      $('.coverList').find('li').each((index, res) => {
        listData.push(dataReturn(res))
      })
      const listDataSort = quickSortByTimestamp(listData, 'stampTime', data.value == 0)
      domHandle(listDataSort)
    })
    //目录列表弹窗
    $('.layui-btn.popList').on('click', function () {
      layer.open({
        type: 1
        , title: false //不显示标题栏
        , closeBtn: false
        , area: ['100%', '100%']
        , shade: 0.8
        , id: 'LAY_layuipro' //设定一个id，防止重复弹出
        // , btn: ['关闭', '搜索']
        , btnAlign: 'c'
        , moveType: 0 //拖拽模式，0或者1
        , content: $('.coverList')
        , success: function (layero, index) {
          //记录索引，以便按 esc 键关闭。事件见代码最末尾处。
          layer.escIndex = layer.escIndex || [];
          layer.escIndex.unshift(index);
        }
      });
    });
    //esc关闭弹窗事件
    $(document).on('keyup', function (e) {
      if (e.keyCode === 27) {
        layer.close(layer.escIndex ? layer.escIndex[0] : 0);
      }
    });
  })
  $('.coverList').find('li').each((index, res) => {
    const data = dataReturn(res)
    listData.push(data)
    initData.push(data)
  })
  $("input[name='title']").on('keyup', function (e) {
    if (e.keyCode === 13) {
      $("#search").click()
    }
  })
  $("#search").on('click', function (e) {
    e.preventDefault()
    const val = $("input[name='title']").val()
    const listDataSort = fuzzySearch(val, listData)
    if (!listDataSort.length) {
      layer.msg('未搜索到相关内容')
      domHandle(initData)
    } else {
      domHandle(listDataSort)
    }
  })

  //排序
  function quickSortByTimestamp(arr, key, isIncremental = true) {
    if (arr.length <= 1) {
      return arr;
    }

    const pivot = arr[Math.floor(arr.length / 2)];
    const less = [];
    const equal = [];
    const greater = [];

    for (const element of arr) {
      if (element[key] < pivot[key]) {
        less.push(element);
      } else if (element[key] > pivot[key]) {
        greater.push(element);
      } else {
        equal.push(element);
      }
    }
    if (isIncremental) {
      return [...quickSortByTimestamp(less, key, isIncremental), ...equal, ...quickSortByTimestamp(greater, key, isIncremental)];
    } else {
      return [...quickSortByTimestamp(greater, key, isIncremental), ...equal, ...quickSortByTimestamp(less, key, isIncremental)];
    }
  }

  function liClick() {
    // 给列表添加点击事件
    $('.coverList li').each((index, item) => {
      $(item).on('click', () => {
        const url = $(item).find('img').data('url')
        $('video').attr('poster', $(item).find('img').attr('src'))
        $('.plyr__title').text($(item).find('h4').text())
        $('.coverList li').each((index, item) => {
          $(item).removeClass('acitve')
        })
        $(item).addClass('acitve')
        // 更新 Plyr 实例的源 URL
        // 更新 <source> 元素的 src 属性
        const sourceElement = player.elements.wrapper.querySelector('source');
        sourceElement.src = url;
        // 更新 Plyr 实例的源
        player.source = {
          type: 'video',
          sources: [
            {
              src: url,
              type: 'video/mp4',
            },
          ],
        };
        player.poster = $(item).find('img').attr('src')
      })
    })
    //鼠标划入选择封面事件
    $('ul').find('li').each((i, res) => {

      $(res).on('mouseenter', debounce(function (event) {

        const img = $(res).find('img')
        const cover = img.data('cover')
        if (cover) {
          $(res).find('img').attr('src', cover)
        }
        return
      }, 50))
      $(res).on('mouseleave', debounce(function (event) {

        const img = $(res).find('img')
        const cover = img.data('cover')
        $(res).find('img').attr('src', cover.replace('png', 'jpg'))
      }, 10))
    })
  }
  // 模糊查询函数
  function fuzzySearch(query, data) {
    const regex = new RegExp(query, 'i'); // 'i'表示不区分大小写
    return data.filter(item => {
      if (regex.test(item.name)) {
        return true; // 如果任何字段匹配查询条件，返回true
      }
      return false; // 如果没有匹配项，返回false
    });
  }

  function domHandle(arr) {
    console.log(`lzy  arr:`, arr)
    $('.coverList ul').html('')
    arr.forEach((item, index) => {
      $('.coverList ul').append(`
          <li data-time="${item.stampTime}">
            <span class="index">${index + 1}</span>
            <p>
              <span>${item.datails.time}</span>
              <span>${item.datails.size}</span>
            </p>
            <img src="${item.img}" data-url="${item.url}" data-cover="${item.cover}" alt="">
            <h4>${item.name}</h4>
          </li>
          `)
    })
    liClick()
  }
  // 防抖
  function debounce(fn, timer) {
    var debItem = null
    return function () {
      var arg = arguments[0]   //获取事件
      if (debItem) {
        clearTimeout(debItem)
      }
      debItem = setTimeout(() => {
        fn(arg)              //事件传入函数
      }, timer)
    }
  }
  //数据合
  function dataReturn(res) {
    return {
      stampTime: $(res).data('time'),
      name: $(res).find('h4').text(),
      img: $(res).find('img').attr('src'),
      url: $(res).find('img').data('url'),
      cover: $(res).find('img').data('cover'),
      datails: {
        time: $(res).find('span').eq(1).text(),
        size: $(res).find('span').eq(2).text()
      }
    }
  }
})
