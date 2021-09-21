import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI(); 

class TasksManager extends React.Component {
    state = {
        time: 0,
        tasks: []
    }
    
    render() {
        return (
            <div class ="container">
                <h1>TasksManager</h1>
                <section onSubmit = {this.addTaskToDB}>
                <form>
                    <input name ="title" onChange={this.changeInput}/>
                    <input name="time" type ="number" onChange={this.changeInput}></input>
                    <input type ="submit"/>
                </form>
                </section>
                <section class="plan">
                    <h2 class="plan__title">Zaplanowane zadania:</h2>
                    <ul class="plan__list list">{this.renderTaskList()}</ul>
                </section>
                <section class="done">
                    <h2 class="done__title">Zadania ukończone:</h2>
                    <ul class="done__list list">{this.renderDoneTaskList()}</ul>
                </section>
            </div>
        
        )
    }

    renderTaskList() {
        return (this.state.tasks.map(item => {
            const {title, time, id, isRemoved, isDone, isRunning} = item;
            if(!isRemoved && !isDone) {
                return (
                    <li class="list__item" data-id={id}> 
                        <header>
                            <h3>{title}</h3>
                            <p> {this.displayTime(time)}</p>
                        </header>
                        <footer>
                            <button className ="btn" onClick = {!isRunning ? this.runTask : this.stopTask }>{isRunning ? "stop" : "start"}</button>
                            <button className ="btn" onClick ={this.finishTask}>Zakończone</button>
                            <button className ="btn" onClick ={this.deleteTask}>Usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }

    renderDoneTaskList() {
        return (this.state.tasks.map(item => {
            const {title, time, id, isDone, isRemoved}= item;
            if(isDone && !isRemoved) {
                return (
                    <li data-id={id}> 
                        <header>
                            <h3>{title}</h3>
                            <p> {this.displayTime(time)}</p>
                        </header>
                        <footer>
                            <button className ="btn" onClick ={this.restoreTask}>Przywróć</button>
                            <button className ="btn" onClick ={this.deleteTask}>Usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }

    componentDidMount (){
        this.loadTasks();   
    }

    addTaskToDB = e => {
        e.preventDefault();
        const {title, time} = e.target.elements
        const task = {
            title: title.value,
            time: time.value,
            // isRunning: false, //chyba nie ma sensu dodawac tyh wartości
            // isDone: false,
            // isRemoved: false
        }
        if (title.value.length> 3 && time.value >0 ) {
            tasksDB.addDataAPI(task)
            tasksDB.loadDataAPI()
                .then(this.loadTasks())
                .catch(err=>console.log(err))
        } else (alert('Treść zadania nie może mieć mniej niż 3 znaki a czas nie moze byc mniejszy od 0'))
    }

    loadTasks() {
        this.setState({tasks:[]})
        tasksDB.loadDataAPI()
            .then(resp => { return resp.map(item => this.setState({tasks: [...this.state.tasks, item]}))})
    }

    onClick = () => {
        const { tasks } = this.state;
    }

    deleteTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadDataAPI()
            .then(res=> res.filter(item => item.id == idTask))
            .then((item) => { 
                if (item[0].isDone) {
                    this.updateTask(idTask, "isRemoved", true)
                } else { alert("Zadanie musi być zakończone by móc je usunąć")}
            })
            .catch(err=>console.log(err))
    }

    finishTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadDataAPI()
            .then(res=> res.filter(item => item.id == idTask))
            .then((item) => {
                if (item[0].isRunning) {alert("Zatrzymaj realizację zadania zanim je zakończysz")
                } else {this.updateTask(idTask, "isDone", true)}
            })
            .catch(err=>console.log(err))
    }

    restoreTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadDataAPI()
            .then(()=> this.updateTask(idTask, "isDone", false))
    }

    runTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadDataAPI()
            .then(()=> this.updateTask(idTask, "isRunning", true))
            .then(()=>this.runTimer(idTask))
    }

    stopTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;

        tasksDB.loadDataAPI()
            .then(res=> res.filter(item => item.id == idTask))
            .then(()=> this.updateTask(idTask, "isRunning", false))
    }

    runTimer (id) {
        tasksDB.loadDataAPI()
        .then(res=> res.filter(item => item.id == id))
        // .then(item => { 
        //     let time = Number(item[0]["time"]);
        //     // this.setState({time: time});
        //     // setInterval(()=> {
        //     //     time--;
        //     //     this.setState({time:time})
        //     //     console.log(time)
        //     // },1000)
        // })
        .then(item => { 
            let time = Number(item[0]["time"]);
            const ind = setInterval(()=> {
                this.updateTask(id,"time", time );
                time--; 
                if (time<0) {
                    clearInterval(ind)
                }
            }, 1000)
        })
    }
    // -----------------------------------------------------

    updateTask(id, prop, val) {
        tasksDB.loadDataAPI()
        .then(res=> res.filter(item => item.id == id))
        .then(item => {{
            item[0][prop] = val;
            tasksDB.updateDataAPI(id, item[0]);
        }})
        .catch(err=>console.log(err))
        .finally(()=>this.loadTasks())
    }

    displayTime(time) {
        return `${Math.floor(time/3600)<10 ? '0'+ Math.floor(time/3600) : Math.floor(time/3600) }:${Math.floor(time/60)%60<10 ? '0' + Math.floor(time/60)%60: Math.floor(time/60)%60}:${time%60<10 ? '0'+time%60:time%60}`
    }
}

export default TasksManager;