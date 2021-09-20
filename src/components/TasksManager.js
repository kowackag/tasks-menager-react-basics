import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI(); 

class TasksManager extends React.Component {
    state = {
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
                    <ul>{this.renderTaskList()}</ul>
                </section>
            </>
        )
    }

    renderTaskList() {
        return (this.state.tasks.map(item => {
            const {title, time, id, isRemoved}= item;
            if(!isRemoved) {
                return (
                    <li data-id={id}> 
                        <header>
                            <h2>{title}</h2>
                            <p> {`${Math.floor(time/360)<10 ? '0'+ Math.floor(time/360) : Math.floor(time/360) }:${Math.floor(time/60)<10 ? '0' + Math.floor(time/60): Math.floor(time/60)}:${time%60<10 ? '0'+time%60:time%60}`}</p>
                        </header>
                        <footer>
                            <button onClick ={this.runTask}>start</button>
                            <button>zakończone</button>
                            <button onClick ={this.deleteTask}>usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }

    componentDidMount (){
        // tasksDB.loadData()
        // .then(resp => { return resp.map(item => this.setState({tasks: [...this.state.tasks, item]}))
        //     })
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

    changeInput =e => {
        // console.log(e.target.value)
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
            .then(res=> res.filter(item => item.id == idTask))
            .then(item => {{
                item[0].isRemoved = true;
                tasksDB.updateData(idTask, item[0]);
                }})
            .finally (()=>this.loadTasks());
    }
}

export default TasksManager;