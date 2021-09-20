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
            <>
                <h1>TasksManager</h1>
                <section onSubmit = {this.addTaskToDB}>
                <form>
                    <input name ="title" onChange={this.changeInput}/>
                    <input name="time" type ="number" onChange={this.changeInput}></input>
                    <input type ="submit"/>
                </form>
                </section>
                <section>
                    <h3>Zaplanowane Zadania:</h3>
                    <ul>{this.renderTaskList()}</ul>
                </section>
                <section>
                    <h3>Zadania ukończone:</h3>
                    <ul>{this.renderDoneTaskList()}</ul>
                </section>
            </>
        )
    }

    renderTaskList() {
        return (this.state.tasks.map(item => {
            const {title, time, id, isRemoved, isDone}= item;
            if(!isRemoved && !isDone) {
                return (
                    <li data-id={id}> 
                        <header>
                            <h2>{title}</h2>
                            <p> {this.displayTime(time)}</p>
                        </header>
                        <footer>
                            <button className ="btn" onClick ={this.runTask}>Start</button>
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
                            <h2>{title}</h2>
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
        }
        if (title.value.length>3 && time.value >0 ) {
            tasksDB.addData(task)
            .then(this.loadTasks())
            .catch(err=>console.log(err))
        } else (alert('Treść zadania nie może mieć mniej niż 3 znaki a czas nie moze byc mniejszy od 0'))
    }

    loadTasks() {
        this.setState({tasks:[]})
        tasksDB.loadData()
            .then(resp => { return resp.map(item => this.setState({tasks: [...this.state.tasks, item]}))})
    }

    onClick = () => {
        const { tasks } = this.state;
        console.log( tasks)
    }

    deleteTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadData()
            .then(()=> this.updateTask(idTask, "isRemoved", true))
    }

    finishTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadData()
            .then(()=> this.updateTask(idTask, "isDone", true))
    }

    restoreTask = e => {
        e.preventDefault;
        const idTask = e.target.parentElement.parentElement.dataset.id;
        tasksDB.loadData()
            .then(()=> this.updateTask(idTask, "isDone", false))
    }

    updateTask(id, prop, val) {
        tasksDB.loadData()
        .then(res=> res.filter(item => item.id == id))
        .then(item => {{
            item[0][prop] = val;
            tasksDB.updateData(id, item[0]);
            }})
        .then(()=>this.loadTasks())
    }

    displayTime(time) {
        return `${Math.floor(time/3600)<10 ? '0'+ Math.floor(time/3600) : Math.floor(time/3600) }:${Math.floor(time/60)%60<10 ? '0' + Math.floor(time/60)%60: Math.floor(time/60)%60}:${time%60<10 ? '0'+time%60:time%60}`
    }
}

export default TasksManager;