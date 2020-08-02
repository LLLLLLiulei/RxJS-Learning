import { Observable, of, from, interval, range, timer, merge, empty, fromEvent, throwError } from 'rxjs'

import { ajax } from 'rxjs/ajax'

import {
  map,
  delay,
  take,
  mapTo,
  filter,
  buffer,
  bufferCount,
  bufferTime,
  bufferWhen,
  tap,
  catchError,
  bufferToggle,
  concatMap,
  mergeMap,
  concatMapTo,
  exhaustMap,
  expand,
  groupBy,
  toArray,
  partition,
  pluck,
  reduce,
  scan,
  switchMap,
  mergeAll,
} from 'rxjs/operators'

function createDemo() {
  let obj = Observable.create((observe) => {
    observe.next('121212')
    observe.error('ok')
    observe.next('121212')
  })

  obj.subscribe({
    next: console.log,
    error: console.error,
    complete: console.log,
  })
}

function ofDemo() {
  let obj = of(1, 2, 3, 4, 5, 6)
  obj.subscribe(console.log)
}

function fromDemo() {
  let obj = from([1, 25, 7, 89, 5, 'fdfd'])
  obj = from(
    new Promise((reject, resolve) => {
      setTimeout((_) => resolve(100), 2000)
    })
  )
  obj.subscribe(console.log)
}

function intervalDemo() {
  let obj = interval(1000).pipe(map((val) => val + '___10').pipe())
  obj.subscribe(console.log)
}

function rangeDemo() {
  let obj = range(10, 20).pipe(map((v) => v))
  obj.subscribe(console.log)
}

function timmerDemo() {
  let obj = timer(1000, 20)
    .pipe

    // delay(2000)
    ()
  obj.subscribe(console.log)
}

function delayDemo() {
  const example = of(null)
  const message = merge(example.pipe(mapTo('Hello')), example.pipe(mapTo('World!'), delay(1000)), example.pipe(mapTo('Goodbye'), delay(2000)), example.pipe(mapTo('World!'), delay(3000)))
  const subscribe = message.subscribe(console.log)
}

function mergeDemo() {
  merge(
    from([1, 2, 3, 4, 5, 6, 7]).pipe(
      take(2),
      map((v) => v + '__'),
      delay(3000)
    ),
    of(10, 20, 30).pipe(mapTo('ok'), delay(1000)),
    range(100, 120).pipe(filter((v) => v % 2 == 0))
  ).subscribe(console.log)
}

function fromEventDemo() {
  fromEvent(document.querySelector('#fromEvent'), 'click').pipe().subscribe(console.log)
}

function throwErrorDemo() {
  throwError(new Error('error')).pipe(catchError()).subscribe(console.log)
}

function bufferDemo() {
  // timer(500,1000).pipe(
  //   buffer(of(1).pipe(delay(5000)))
  // ).subscribe(console.log)

  range(0, 10).pipe(delay(5000)).subscribe(console.log)
}

function bufferCountDemo() {
  interval(1000).pipe(bufferCount(3, 5)).subscribe(console.log)
}

function bufferTimeDemo() {
  interval(1000).pipe(bufferTime(3000)).subscribe(console.log)
}

function bufferToggleDemo() {
  interval(1000)
    .pipe(bufferToggle(interval(5000), (_) => interval(3000)))
    .subscribe(console.log)
}

function bufferWhenDemo() {
  interval(1000)
    .pipe(bufferWhen((_) => interval(5000)))
    .subscribe(console.log)
}

function concatMapDemo() {
  of(2000, 1000)
    .pipe(
      concatMap(
        (v) => of('promise ' + v),
        (w) => w + '__'
      )
      // concatMap(v=>of(v).pipe(delay(v)))
      // mergeMap(v=>of(v).pipe(delay(v)))
    )
    .subscribe(console.log)
}

function concatMapToDemo() {
  // let two=interval(500).pipe(
  //   take(5)
  // )
  // let one = of('one').pipe(
  //   delay(5000)
  // )

  // two.pipe(
  //   concatMapTo(one)
  // ).subscribe(console.log)

  interval(2000)
    .pipe(
      tap((v) => console.log('interval:' + v)),
      concatMapTo(
        interval(500).pipe(
          map((v) => `v${v}`),
          take(5)
        ),
        (a, b) => `${a}---${b}`
      )
    )
    .subscribe(console.log)
}

function exhaustMapDemo() {
  let one = interval(1000).pipe(take(2))

  let two = interval(1000).pipe(take(10))
  two
    .pipe(
      exhaustMap((v) => {
        console.log('vv:' + v)
        return one
      })
    )
    .subscribe(console.log)
}

function expandDemo() {
  of(1)
    .pipe(
      expand((v) => of(v + 1)),
      take(5)
    )
    .subscribe(console.log)
}

function groupByDemo() {
  const people = [
    { name: 'Sue', age: 25 },
    { name: 'Joe', age: 30 },
    { name: 'Frank', age: 25 },
    { name: 'Sarah', age: 35 },
  ]

  from(people)
    .pipe(
      groupBy((v) => v.age),
      mergeMap((g) => g.pipe(toArray()))
    )
    .subscribe(console.log)
}

function mapDemo() {
  const source = from([
    { name: 'Joe', age: 30 },
    { name: 'Frank', age: 20 },
    { name: 'Ryan', age: 50 },
  ])

  from(source)
    .pipe(map(({ name }) => name))
    .subscribe(console.log)
}

function mapToDemo() {
  from([1, 2, 3, 4, 5, 6])
    .pipe(concatMap((v) => of(v).pipe(delay(1000))))
    .subscribe(console.log)
}

function mergeMapDemo() {
  let p = (v) => new Promise((rs) => rs('from promise:' + v))
  of(1, 2, 3)
    .pipe(
      mergeMap(
        (v) => {
          return p(v)
        },
        (v, v1) => `${v}---${v1}`
      )
    )
    .subscribe(console.log)
}

function partitionDemo() {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let [e, o] = from(arr)
    .pipe(
      // partition(v=>v%2==0)

      map((v) => {
        if (v > 3) {
          throw new Error('error')
        }
        return { success: true, v }
      }),
      catchError((v) => of({ v }))
    )
    .pipe(partition((v) => v.success))

  merge(e.pipe(map((v) => v)), o.pipe(map((v) => v))).subscribe(console.log)
}

function pluckDemo() {
  let source = [
    { a: 1, b: { c: 1 } },
    { a: 12, b: { c: 12 } },
    { a: 13, b: { c: 13 } },
    { a: 14, b: { c: 14 } },
    { a: 15, b: { c: 15 } },
    { a: 16, b: { c: 16 } },
  ]

  from(source).pipe(pluck('b', 'c')).subscribe(console.log)
}

function reduceDemo() {
  of(1, 2, 3, 4, 5, 6, 7, 8, 9)
    .pipe(
      reduce((res, val) => {
        console.log('1', res, val)

        let a = Array.isArray(res) ? res : [res]
        a.push(val)
        return a
        // return res+val
      })
    )
    .subscribe(console.log)
}

function scanDemo() {
  // interval(500).pipe(
  //   scan((res,v)=>[...res,v],[])
  // ).subscribe(console.log)

  from([{ a: 1 }, { b: 2 }, { c: 3 }])
    .pipe(scan((res, v) => Object.assign({}, res, v), {}))
    .subscribe(console.log)
}

function switchMapDemo() {
  timer(0, 5000)
    .pipe(switchMap((v) => interval(100).pipe(map((val) => `s ${val}`))))
    .subscribe(console.log)
}

function ajaxDemo() {
  // ajax.get('http://ecm.saas.slimcloud.com/heartbeat').pipe(
  //   map(v=>new Date(v.response.time))

  // ).subscribe(v=>{
  //   console.log('observer',v)
  // })
  ajax
    .getJSON('http://ecm.saas.slimcloud.com/server/companys/c336c544d2ea41c9ae9d93efa0e638a0/directorys', {
      CMPID: 'c336c544d2ea41c9ae9d93efa0e638a0',
      GUID: 'b1da407ce0a5408b847f4151d41783ff',
      TOKEN:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlY20gY2xpZW50IiwiaXNzIjoienZpbmciLCJjbGFpbURlZmF1bHRLZXkiOiJsaXVsZWkwMSIsImV4cCI6MTU5NTgxNzgxMSwiaWF0IjoxNTk1MjEzMDExLCJqdGkiOiI2NTQ1ZWM1ZDhmMDM0NjQzOGVlOWNiZDhlZmZlNGEyMiJ9.-kwWQqFE_A-N4zyjoOI41OW8k6s7aK9onyeiJ3H5ebE',
    })
    .pipe(
      tap(console.log),
      pluck('data'),
      // map(v=> v.map(item=>item.serverURL)),
      map((v) => from(v).pipe(map((node) => node.serverURL))),
      mergeAll(),
      // reduce((res,current)=>{
      //   res.push(current)
      //   return res
      // },[]),
      // map(v=>[...new Set(v)]),
      filter((v) => !/^https:\/\//.test(v)),
      take(1)
    )
    .subscribe((v) => {
      console.log('observer', v)
    })
}

function bfw() {
  //  interval(1000).pipe(
  //   tap(v=>{console.log(Date.now()+':interval:'+v)}),
  //    bufferWhen(_=>{
  //      console.log(Date.now()+':bfw')
  //     return interval(5000).pipe(tap(v=>{console.log(Date.now()+':bfw:'+v)}))
  //    })
  //  ).subscribe(v=>{console.log(Date.now()+':'+v)})

  // interval(1000).pipe(
  //   tap(console.log),
  //   bufferTime(5000)
  // ).subscribe(console.log)

  let arr = []
  let bfwInterval
  let subscribe = (v) => {
    console.log('subscribe:', v)
  }

  let clear = (_) => {
    clearInterval(bfwInterval)
    arr = []
  }
  let bfw = (_) => {
    clear
    return (bfwInterval = setInterval((_) => {
      //emitData
      subscribe(arr)
      clear()
      bfw()
    }, 5000))
  }
  bfw()

  let i = 0
  let inter = setInterval((_) => arr.push(i++), 1000)
}

function cDemo() {
  let promise = new Promise((resolve, reject) => {
    setTimeout((_) => resolve(1), 2000)
  })
  let source$ = from(promise)
  let subcription = source$.subscribe(console.log)
}

function cDemo1() {
  let promise = new Promise((r) => r([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]))
  // promise=[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6}]
  let source$ = from(promise)
    .pipe
    // mergeMap(v=>from(v).pipe(
    //       filter(v=>v.id%2===0),
    //       pluck('id'),
    //       reduce((arr,current)=>{
    //         arr.push(current)
    //         return arr
    //       },[]),
    //       map(v=>v.join('----'))
    //     ))
    // map(v=>of(JSON.stringify(v)))
    // switchMap(v=>from(v).pipe(
    //     filter(v=>v.id%2===0),
    //     pluck('id'),
    //     reduce((arr,current)=>{
    //       arr.push(current)
    //       return arr
    //     },[]),
    //     map(v=>v.join('----'))
    //   )
    // )
    ()
  source$.subscribe(console.log)
}

function cDemo2() {
  // interval(1000).pipe(
  //   bufferTime(3000)
  // ).subscribe(console.log)

  let arr = []
  let i = 0

  let emitData = (data) => {
    console.log(data)
  }

  let bt = setInterval((_) => {
    // emitData
    emitData([...arr])
    arr = []
  }, 3000)

  let it = setInterval((_) => {
    arr.push(i++)
  }, 1000)
}

// cDemo2()

function mergeAllDemo() {
  const getData = (param) => {
    return of(`retrieved new data with param ${param}`).pipe(delay(1000))
  }

  // using a regular map
  // from([1,2,3,4]).pipe(
  //   map(param => getData(param))
  // ).subscribe(val => val.subscribe(console.log));

  // from([1,2,3,4]).pipe(
  //   map(param => getData(param)),
  //   mergeAll()
  // ).subscribe(console.log);

  // from([1,2,3,4]).pipe(
  //   mergeMap(param => getData(param)),
  // ).subscribe(console.log);

  interval(1000)
    .pipe(
      take(2),
      map((x) =>
        interval(1500).pipe(
          map((y) => `${x}:${y}`),
          take(2)
        )
      ),
      mergeAll()
    )
    .subscribe(console.log)
}

ajaxDemo()

function subjectDemo1() {
  let subject = new Subject()
  let source$ = interval(1000).pipe(take(3))
  source$.subscribe(subject)
  subject.subscribe((val) => {
    console.log('Observer 1', val)
  })
  setTimeout((_) => {
    subject.subscribe((val) => {
      console.log('Observer 2', val)
    })
  }, 2000)
}

function subjectDemo2() {
  let source$ = interval(500).pipe(take(3))
  let connectableSource$ = source$.pipe(multicast(new Subject()))
  connectableSource$.subscribe((val) => {
    console.log('Observer 1', val)
  })
  setTimeout((_) => {
    connectableSource$.subscribe((val) => {
      console.log('Observer 2', val)
    })
  }, 1000)
  setTimeout(() => {
    connectableSource$.connect()
  }, 1000)
}

function refCountDemo() {
  let source$ = interval(1000).pipe(
    multicast((_) => new Subject()),
    refCount()
  )
  let observerA, observerB
  observerA = source$.subscribe((val) => {
    console.log('Observer A', val)
  })
  setTimeout(() => {
    observerB = source$.subscribe((val) => {
      console.log('Observer B', val)
    })
  }, 1000)
  setTimeout(() => {
    observerA.unsubscribe()
    observerB.unsubscribe()
  }, 3000)
}

function schedulersDemo1() {
  let source1$ = from([1, 2, 3, 4, 5, 6], async)
  console.log('before subscribe ')
  source1$.subscribe({
    next: console.log,
    complete: (_) => console.log('complete'),
  })
  console.log('after subscribe ')
}

function schedulersDemo2() {
  let source1$ = Observable.create((ob) => {
    console.log('doing')
    ob.next(1)
    ob.next(2)
    ob.complete()
  }, async)
  console.log('before subscribe')
  source1$.subscribe({
    next: console.log,
    complete: (_) => console.log('complete '),
  })
  console.log('after subscribe')
}

function myOperator(callback) {
  return (source) =>
    Observable.create((sb) =>
      source.subscribe({
        next: (val) => {
          try {
            sb.next(callback(val))
          } catch (e) {
            sb.error(e)
          }
        },
        error: (err) => sb.error(err),
        complete: () => sb.complete(),
      })
    )
}

interval(1000).pipe(windowCount(2), mergeAll()).subscribe(console.log)
// interval(1000).pipe(bufferCount(2)).subscribe(console.log)
