import {
  Observable,
  fromEvent,
  Subscriber,
  from,
  forkJoin,
  Subject,
  of,
  throwError,
} from 'rxjs'
import {
  tap,
  pluck,
  map,
  filter,
  switchMap,
  mergeAll,
  delayWhen,
  takeUntil,
  repeatWhen,
  distinctUntilChanged,
  catchError,
  retryWhen,
} from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import * as SparkMD5 from 'spark-md5'
import {
  Chunk,
  UploadFile,
  UploadEvent,
  UploadParams,
  EventType,
} from './types'

class FileUploader {
  concurrency: number = 1
  chunkSize: number = 1024 * 1024
  $chooseFileBtn: HTMLButtonElement = document.querySelector('#chooseFileBtn')
  $startBtn: HTMLButtonElement = document.querySelector('#startBtn')
  $pauseBtnBtn: HTMLButtonElement = document.querySelector('#pauseBtn')
  $resumeBtn: HTMLButtonElement = document.querySelector('#resumeBtn')
  $fileName: HTMLDivElement = document.querySelector('#fileName')
  $process: HTMLDivElement = document.querySelector('#process')
  $fileInput: HTMLInputElement = document.querySelector('#fileInput')

  subject: Subject<UploadEvent> = new Subject()

  pause$ = fromEvent(this.$pauseBtnBtn, 'click').pipe(
    tap(() => this.showBtn(this.$resumeBtn))
  )

  resume$ = fromEvent(this.$resumeBtn, 'click').pipe(
    tap(() => this.showBtn(this.$pauseBtnBtn))
  )

  start$ = fromEvent(this.$startBtn, 'click').pipe(
    tap(() => this.showBtn(this.$pauseBtnBtn))
  )

  progress$ = this.subject.pipe(
    filter((e: UploadEvent) => e.type === EventType.Progress),
    distinctUntilChanged(
      (val: UploadEvent, oldVal: UploadEvent) => val.data - oldVal.data > 0
    ),
    tap((e: UploadEvent) => {
      let percent = e.data + '%'
      this.$process.parentElement.style.display = 'block'
      this.$process.querySelector('div').innerText = percent
      this.$process.querySelector('div').style.width = percent
      console.log(percent)
    })
  )

  file$: Observable<File> = fromEvent(this.$fileInput, 'change').pipe(
    pluck('target', 'files'),
    filter((v: FileList) => v && !!v.length),
    map((v) => v[0])
  )

  upload$ = this.file$.pipe(
    tap((file: File) => {
      this.$fileName.innerHTML = `文件名：${file.name}</br>md5值：计算中。。。`
      this.$fileName.style.display = 'block'
      this.showBtn()
    }),
    switchMap((file: File) =>
      this.getFileMd5(file).pipe(map((md5) => ({ md5, file })))
    ),
    tap((uploadFile: UploadFile) => {
      this.$fileName.innerHTML = `文件名：${uploadFile.file.name}</br>md5值：${uploadFile.md5}`
      this.showBtn(this.$startBtn)
    }),
    delayWhen(() => this.start$),
    switchMap((uploadFile: UploadFile) =>
      this.getFileChunks(this.chunkSize, uploadFile.file).pipe(
        map((chunks: Chunk[]) => Object.assign({}, uploadFile, { chunks }))
      )
    ),
    tap(console.log),
    switchMap(this.uploadChunks.bind(this)),
    tap(() => this.showBtn())
  )

  getFileMd5(file: File): Observable<string> {
    return Observable.create((ob: Subscriber<string>) => {
      let spak = new SparkMD5.ArrayBuffer()
      let fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        let res: ArrayBuffer = e.target.result as ArrayBuffer
        spak.append(res)
        let md5: string = spak.end()
        ob.next(md5)
        ob.complete()
        return () => fileReader.abort()
      }
    })
  }

  getFileChunks(chunkSize: number, file: File): Observable<Chunk[]> {
    return Observable.create((ob: Subscriber<Chunk[]>) => {
      let chunks: Chunk[] = []
      let start = 0
      let end = 0
      let chunkCount = Math.max(1, Math.floor(file.size / chunkSize))
      for (let i = 0; i < chunkCount; i++) {
        start = end
        end = i + 1 === chunkCount ? file.size : end + chunkSize
        chunks.push({ start, end })
      }
      ob.next(chunks)
      ob.complete()
    })
  }

  uploadChunks(uploadFile: UploadFile): Observable<ProgressEvent[]> {
    let { file, chunks, md5 } = uploadFile
    let uploaded: number[] = []
    let progressHandler = (e: ProgressEvent, index: number) => {
      console.log('FileUploader -> e', e)
      uploaded[index] = e.loaded || 0
      let totalLoaded = uploaded.reduce((res, cur) => res + (cur || 0))
      totalLoaded = Math.min(file.size, totalLoaded)
      let percent = Math.round((totalLoaded / file.size) * 100)
      this.subject.next({ type: EventType.Progress, data: percent })
    }
    let chunkTasks$: Observable<ProgressEvent>[] = chunks.map(
      (chunk: Chunk, index: number) => {
        let uploadParams: UploadParams = {
          chunkNumber: index + 1,
          identifier: md5,
          filename: file.name,
          relativePath: file.name,
          totalChunks: chunks.length,
        }
        return this.postChunk(uploadParams, file, chunk).pipe(
          tap((e: ProgressEvent) => progressHandler(e, index))
        )
      }
    )
    return forkJoin(from(chunkTasks$).pipe(mergeAll(this.concurrency)))
  }

  postChunk(
    params: UploadParams,
    file: File,
    chunk: Chunk
  ): Observable<ProgressEvent> {
    return Observable.create((ob: Subscriber<ProgressEvent>) => {
      let ajax$ = ajax({
        url: 'http://ecm.test.work.zving.com/catalogs/1346/files/upload',
        method: 'post',
        headers: {
          CMPID: 'f05dd7da36ba4e238f9c1f053c2e76e3',
          TOKEN:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlY20gY2xpZW50IiwiaXNzIjoienZpbmciLCJjbGFpbURlZmF1bHRLZXkiOiJhZG1pbiIsImV4cCI6MTU5NjM1Mzg0NywiaWF0IjoxNTk1NzQ5MDQ3LCJqdGkiOiI5MjUyYTU5NGYwNmU0YWQxYTNkOGUwZWRjY2RkMjY2YiJ9.VEmintA1bL8WVADf-5fAhpFGRRkDy1j8w45XWsBBhSo',
          GUID: '787845727d8345289a9bdc97de6e8556',
        },
        body: (() => {
          let formData = new FormData()
          params.file = file.slice(chunk.start, chunk.end)
          Object.keys(params).forEach((k) => formData.append(k, params[k]))
          return formData
        })(),
        progressSubscriber: ob,
      }).pipe(
        takeUntil(this.pause$),
        repeatWhen(() => this.resume$)
      )
      let sub = ajax$.subscribe(console.log)
      return () => sub.unsubscribe()
    }).pipe(
      catchError((err) => {
        this.showBtn(this.$resumeBtn)
        return throwError(err)
      }),
      retryWhen(() => this.resume$)
    )
  }

  showBtn(displayBtn?: HTMLButtonElement) {
    let btns = [
      this.$chooseFileBtn,
      this.$startBtn,
      this.$pauseBtnBtn,
      this.$resumeBtn,
    ]
    btns.forEach((btn) => {
      btn.style.display = btn === displayBtn ? 'block' : 'none'
    })
  }

  constructor() {
    this.$chooseFileBtn.addEventListener('click', () => {
      this.$fileInput.click()
    })
    of(this.upload$, this.progress$).pipe(mergeAll()).subscribe()
  }
}
new FileUploader()
