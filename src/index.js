import { Observable, from, interval, Subject } from 'rxjs'
import {
  map,
  filter,
  mapTo,
  take,
  bufferTime,
  multicast,
  refCount,
  tap,
} from 'rxjs/operators'

function hi() {
  let source$ = Observable.create(function (ob) {
    setInterval((_) => {
      console.log('ing')
      ob.next('hi')
    }, 1000)
  })
  //    let sub =  source$.subscribe(console.log)
  //    setTimeout(() => {
  //     sub.unsubscribe()
  //    }, 5000);
}
// hi()

function fromDemo() {
  //    let source$ = from([1,2,3,4,5,6,7]).pipe(
  //         map(v=>v+'___'),
  //         filter(v=>!v.startsWith(1)),
  //         mapTo(10),
  //         take(2)
  //    )

  //     let source$= interval(2000).pipe(
  //         bufferTime(3000)
  //     )
  //    source$.subscribe(console.log)

  let arr = []
  let i = 0
  let bf = setInterval((_) => {
    console.log(arr)
    arr = []
  }, 300)

  let inter = setInterval((_) => {
    arr.push(++i)
  }, 200)

  // 1------2------3------4------5------6------7------8------9------10------11
  //     inter[0]       inter[1]

  //             bf[0]                  bf[1]

  // taskQueue[bf,inter]
}

// fromDemo()

function sbDemo() {
  //   let subject = new Subject()

  //   subject.subscribe(console.log)
  //   subject.subscribe(console.log)
  //   subject.next(1)
  //   subject.next(2)
  //   const multi = interval(1000).pipe(multicast(() => new Subject()))
  //   multi.subscribe(console.log)

  let a = from([1, 2, 3, 4, 5, 6])
  //   a = Observable.create((ob) => {
  //     ob.next(1)
  //     ob.next(2)
  //     ob.next(3)
  //     ob.next(4)
  //     ob.next(5)
  //     ob.next(6)
  //   })
  //   a = interval(1000)
  let source$ = a
    .pipe(
      tap((v) => {
        console.log('v', v)
      }),
      multicast((v) => new Subject()),
      refCount()
    )
    .refCount()
  source$.subscribe(console.error)
  source$.subscribe(console.log)
  //   source$.connect()
  //   source$ = source$.connect()
  console.log(source$)

  //   let source$ = from([1, 2, 3, 4, 5, 6])
  //   let subject = new Subject()
  //   subject.subscribe(console.error)
  //   subject.subscribe(console.log)
  //   source$.subscribe(subject)
}

sbDemo()
