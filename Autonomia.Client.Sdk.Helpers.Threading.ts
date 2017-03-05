namespace Autonomia.Client.Sdk.Helpers.Threading {

    // Implementation for "Thread"
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export interface IThread {
        Start();
        Stop();
        IsRunning();
    }
 
    export class PeriodicalThread implements IThread {
        private _threadId: number;
        private _threadedCode: any;
        private _period: any;
 
        constructor(threadedCode: any, period: number) {
            this._threadId = 0;
            this._threadedCode = threadedCode;
            this._period = period;
        }
 
        public Start() {
            var thisRef = this;
 
            if (Helpers.IsNullOrEmpty(thisRef._threadedCode) || thisRef.IsRunning()) {
                return;
            }
 
            thisRef._threadId = setInterval(function () {
                thisRef._threadedCode();
            }, thisRef._period);
        }
 
        public Stop() {
            var thisRef = this;
 
            clearInterval(thisRef._threadId);
            thisRef._threadId = 0;
        }
 
        public IsRunning() {
            return (this._threadId !== 0);
        }
    }
 
     // Implementation for "Semaphore" (inc/dec) => https://inst.eecs.berkeley.edu/~cs162/sp10/hand-outs/synch.html
    // Will notify when a ton of threads are done executing.
    // Those threads must reference the semaphore to "say ThreadStarted/ThreadFinished"
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export class Semaphore {
        private _count: number;
        private _monitoringThread: IThread;
 
        public WhenAllThreadsFinsihed: Events.Event<void> = new Events.Event<void>();
 
        constructor() {
            var thisRef = this;
 
            thisRef._count = 0;
            thisRef._monitoringThread = new PeriodicalThread(function () {
                if (thisRef._count <= 0) {
                    thisRef.WhenAllThreadsFinsihed.Notify();
                    thisRef._monitoringThread.Stop();
                }
            }, 2000);
        }
 
        public ThreadStarted() {
            var thisRef = this;

            thisRef._count++;
            thisRef._monitoringThread.Start();
        }
 
        public ThreadFinished() {
            var thisRef = this;
 
            thisRef._count--;
        }
    }
}