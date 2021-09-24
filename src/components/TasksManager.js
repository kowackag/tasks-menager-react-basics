import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI();

class TasksManager extends React.Component {
    state = {
        time: 0,
        tasks: [],
    }

    render() {
        return (
            <div className="container">
                <h1 className="section-title">TasksManager</h1>
                <section className ="section-form"onSubmit={this.addTaskToDB}>
                    <form className ="form">
                        <input className="form__task" name ="title" onChange={this.changeInput} />
                        {/* <input className="form__time" name="time" type="number" onChange={this.changeInput}></input> */}
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
            const { title, time, id, isRemoved, isDone, isRunning } = item;
            if (!isRemoved && !isDone) {
                return (
                    <li className="list__item" data-id={id}>
                        <header className="header">
                            <h3 className="header__title">{title}</h3>
                            <p className="header__time"> {this.displayTime(time)}</p>
                        </header>
                        <footer className ="footer">
                            <button className="btn" onClick={!isRunning ? this.runTask : this.stopTask}>{isRunning ? "stop" : "start"}</button>
                            <button className="btn" onClick={this.finishTask}>Zakończone</button>
                            <button className="btn" onClick={this.deleteTask}>Usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }

    renderDoneTaskList() {
        return (this.state.tasks.map(item => {
            const { title, time, id, isDone, isRemoved } = item;
            if (isDone && !isRemoved) {
                return (
                    <li className="list__item" data-id={id}>
                        <header className="header">
                            <h3 className="header__title">{title}</h3>
                            <p className="header__time"> {this.displayTime(time)}</p>
                        </header>
                        <footer className ="footer">
                            <button className="btn" onClick={this.restoreTask}>Przywróć</button>
                            <button className="btn" onClick={this.deleteTask}>Usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }

    componentDidMount() {
        this.loadTasks();
    }

    addTaskToDB = e => {
        e.preventDefault();
        console.log(e.target)
        const {title} = e.target.elements;
        const task = {
            title: title.value,
            time: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false
        }
        if (title.value.length > 3) {
            tasksDB.addDataAPI(task)
                .then(() => this.loadTasks())
                .catch(err => console.log(err))
        } else (alert('Treść zadania nie może mieć mniej niż 3 znaki'))
    }

    loadTasks() {
        tasksDB.loadDataAPI()
            .then(resp => this.setState({ tasks: resp }))
    }

    finishTask = e => {
        e.preventDefault();
        const idTask = e.target.parentElement.parentElement.dataset.id;
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => {
            if (item.id === Number(idTask)) {
                if(!item.isRunning) {
                    item.isDone = true;
                    tasksDB.updateDataAPI(idTask, item)
                        .catch(err => console.log(err))
                } else {
                    alert("Zatrzymaj realizację zadania zanim je zakończysz")
                }
            }
         })
         this.setState({tasks:copyTasks})
    }

    deleteTask = e => {
        e.preventDefault();
        const idTask = e.target.parentElement.parentElement.dataset.id;
        const copyTasks = this.state.tasks.slice();
        copyTasks.map(item => {
            if (item.id === Number(idTask)) {
                if(item.isDone) {
                    item.isRemoved = true;
                    tasksDB.updateDataAPI(idTask, item)
                        .catch(err => console.log(err))
                } else {
                    alert("Zatrzymaj realizację zadania zanim je zakończysz")
                }
            }
         })
         this.setState({tasks:copyTasks})
    }

    restoreTask = e => {
        e.preventDefault();
        const idTask = e.target.parentElement.parentElement.dataset.id;
        this.updateTask(idTask, "isDone", false)
    }

    runTask = e => {
        e.preventDefault();
        const idTask = e.target.parentElement.parentElement.dataset.id;
        this.updateTask(idTask, "isRunning", true)
        this.runTimer(idTask)
        const timeEl = e.target.parentElement.parentElement.querySelector('.header__time');
        timeEl.classList.add('isRunning');
    }

    stopTask = e => {
        e.preventDefault();
        const idTask = e.target.parentElement.parentElement.dataset.id;
        const timeEl = e.target.parentElement.parentElement.querySelector('.header__time');
        timeEl.classList.remove('isRunning');
        this.updateTask(idTask, "isRunning", false);
        tasksDB.loadDataAPI()
            .then(res => res.filter(item => item.id == idTask))
            .then(item => clearInterval(item[0].index))
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
        tasksDB.loadDataAPI()
            .then(res => res.filter(item => item.id === Number(id)))
            .then(item => {
                let time = Number(item[0]["time"]);
                const ind = setInterval(() => {
                    time++;
                    this.updateTask(id, "time", time);
                }, 1000)
                this.updateTask(id, "index", ind);
            })
    }

    displayTime(time) {
        return `${Math.floor(time / 3600) < 10 ? '0' + Math.floor(time / 3600) : Math.floor(time / 3600)}:${Math.floor(time / 60) % 60 < 10 ? '0' + Math.floor(time / 60) % 60 : Math.floor(time / 60) % 60}:${time % 60 < 10 ? '0' + time % 60 : time % 60}`
    }
}

export default TasksManager;