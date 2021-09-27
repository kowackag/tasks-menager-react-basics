import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI();

class TasksManager extends React.Component {
    state = {
        task: "",
        runningTask:"",
        tasks: [],
    }

    render() {
        return (
            <div className="container">
                <h1 className="section-title">TasksManager</h1>
                <section className ="section-form" onSubmit={this.addTaskToDB}>
                    <form className ="form">
                        <input className="form__task" value={this.state.task} onChange={this.changeInput} name ="task" onChange={this.changeInput} />
                        <input className="submit btn" type="submit" />
                    </form>
                </section>
                <section className="plan">
                    <h2 className="plan__title">Zaplanowane zadania:</h2>
                    <ul className="list">{this.renderTaskList()}</ul>
                </section>
                <section className="done">
                    <h2 className="done__title">Zadania ukończone:</h2>
                    <ul className="done__list list">{this.renderDoneTaskList()}</ul>
                </section>
            </div>
        )
    }

    renderTaskList() {
        return (this.state.tasks.map(item => {
            const {isRemoved, isDone} = item;
            if (!isRemoved && !isDone) {
                return (
                    this.renderListItem(item)
                )
            }
        }))
    }
    
    renderDoneTaskList() {
        return (this.state.tasks.map(item => {
            const {isDone, isRemoved } = item;
            if (isDone && !isRemoved) {
                return (
                    this.renderListItem(item)
                )
            }
        }))
    }

    renderListItem(item) {
        // nie wiem czy był sens rozdzielac na renderHeader i renderFooter??
        return(
            <li className="list__item"> 
                {this.renderHeader(item)} 
                {this.renderFooter(item)}
            </li>
        )
    }
    
    renderHeader(item) {
        const {title, time, isRunning } = item;
        return(
            <header className="header">
                <h3 className="header__title">{title}</h3>
                <p className={"header__time " + (isRunning ? "isRunning" : "")}> {this.displayTime(time)}</p>
            </header> 
        )
    }

    renderFooter(item) {
        const {isRunning, isDone } = item;
        return(
            <footer className ="footer">
                <button className={"btn " + (isDone ? "isDone" : "") } onClick={()=> !isRunning ? this.runTask(item) : this.stopTask(item)}>{isRunning ? "stop" : "start"}</button>
                <button className="btn" onClick={() => !isDone ? this.finishTask(item): this.restoreTask(item)}>{isDone ? "przywróć" : "zakończ"}</button>
                <button className="btn" onClick={() => this.deleteTask(item)}>Usuń</button>
            </footer>
        )
    }

    componentDidMount() {
        this.loadTasks();
    }

    changeInput = e => {
        const {name, value} = e.target;
        this.setState({
            [name]: value,
        });
    }

    addTaskToDB = e => {
        e.preventDefault()
        const task = {
            title: this.state.task,
            time: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false
        }
        if (task.title.length > 3) {
            tasksDB.addDataAPI(task)
                .then(() => this.loadTasks())
                .catch(err => console.log(err))
        } else (alert('Treść zadania nie może mieć mniej niż 3 znaki'))
    }

    loadTasks() {
        tasksDB.loadDataAPI()
            .then(resp => this.setState({ tasks: resp }))
    }

    finishTask = task => {
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => {
            if (item.id === Number(task.id)) {
                if(!item.isRunning) {
                    item.isDone = true;
                    tasksDB.updateDataAPI(task.id, item)
                        .catch(err => console.log(err))
                } else {
                    alert("Zatrzymaj realizację zadania zanim je zakończysz")
                }
            }
         })
         this.setState({tasks:copyTasks})
    }

    deleteTask = task => {
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => {
            if (item.id === Number(task.id)) {
                if(item.isDone) {
                    item.isRemoved = true;
                    tasksDB.updateDataAPI(task.id, item)
                        .catch(err => console.log(err))
                } else {
                    alert("Zadanie musi byc zakońćzone zanim je usuniesz")
                }
            }
         })
         this.setState({tasks:copyTasks})
    }

    restoreTask = task => {
       this.updateTask(task.id, "isDone", false)
    }

    runTask = task => {
        console.log(this.state.runningTask)
        if(!this.state.runningTask) {
            this.updateTask(task.id, "isRunning", true)
            this.runTimer(task.id)
            this.setState({runningTask: task})
        } else {alert(`Aktualnie realizujesz: ${this.state.runningTask.title}. Musisz zatrzymac zadanie zanim rozpoczniesz kolejne!`)}
    }

    stopTask = task => {
        this.updateTask(task.id, "isRunning", false);
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => { 
            if (item.id === Number(task.id)){
                clearInterval(item.index)
                this.updateTask(task.id,"time", item.time);
                this.updateTask(task.id, "index", item.ind);
                this.setState({runningTask: ""})
            }    
        })
    }

    // -----------------------------------------------------
    
    updateTask(id, prop, val) {
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => {
            if (item.id === Number(id)) {
                item[prop] = val;
                tasksDB.updateDataAPI(id, item)
                    .catch(err => console.log(err)) 
            }
         })
         this.setState({tasks:copyTasks})
    }

    runTimer(id) {
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => { 
            if (item.id === Number(id)){
                const ind = setInterval(()=>{
                    let time = item.time;
                    time++;
                    this.updateTask(id,"time", time)
                },1000)
                this.updateTask(id, "index", ind);
            }
        })
    }

    displayTime(time) {
        const hour = Math.floor(time / 3600);
        const min = Math.floor(time / 60) % 60;
        const sec = time % 60;
        return `${hour < 10 ? '0' + hour : hour}:${ min < 10 ? '0' + min : min}:${ sec < 10 ? '0' + sec : sec}`
    }
}

export default TasksManager;